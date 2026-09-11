# Design Note

This document describes the system design of the LLD Practice Platform — the architecture, data model, API surface, evaluation subsystem, and the key design decisions and trade-offs.

## 1. Goals and non-goals

**Goals**
- Let learners browse LLD problems, submit design solutions, and receive structured feedback.
- Provide a deterministic numeric score plus optional qualitative AI review.
- Keep the architecture simple and easy to extend.

**Non-goals (for this iteration)**
- Token-based authentication/authorization (JWT reserved, not yet implemented).
- Real-time collaboration or social features.
- A problem-authoring/admin UI.
- Horizontal scaling (single Node process + single Postgres instance is sufficient).

## 2. High-level architecture

The system is a classic **client–server** web application with a clear layering on the backend:

```
Browser (React SPA)
   │  HTTP/JSON over REST
   ▼
Express app (app.ts)
   │  CORS + JSON body parsing
   ▼
Routes (routes/*.ts)  ──▶  Controllers (controllers/*.ts)  ──▶  Prisma client  ──▶  PostgreSQL
                                   │
                                   ▼
                        EvaluationService (async)
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
           RuleBasedEvaluator              LLMEvaluator (OpenAI)
```

**Layering rationale**

- **Routes** map URLs to handlers and keep the HTTP concerns (paths, methods) in one place.
- **Controllers** handle request validation, status codes, and orchestration; they are thin and delegate data access to Prisma.
- **Evaluation subsystem** is isolated behind an `Evaluator` interface (`evaluation/types.ts`) so evaluators are interchangeable and testable independently of the request lifecycle.

## 3. Data model

The schema lives in `backend/prisma/schema.prisma`. Five core models and five enums.

### Entities

| Model      | Purpose                                                              | Key fields                                   |
| ---------- | -------------------------------------------------------------------- | -------------------------------------------- |
| `Learner`  | A user of the platform                                               | `name`, `email` (unique), `password` (hashed) |
| `Problem`  | An LLD problem to solve                                              | `title`, `slug` (unique), `description`, `requirements[]`, `difficulty` |
| `Attempt`  | A learner's session on a problem                                     | `learnerId`, `problemId`, `status`, `startedAt`, `submittedAt` |
| `Submission` | The solution content submitted for an attempt                      | `attemptId` (unique), `format`, `content`    |
| `Feedback` | The evaluation result for a submission                               | `submissionId` (unique), `status`, `evaluator`, `score`, `strengths[]`, `issues[]`, `suggestions[]`, `reasoning` |

### Relationships

```
Learner 1 ──── * Attempt * ──── 1 Problem
                 Attempt 1 ──── 0..1 Submission 1 ──── 0..1 Feedback
```

- A learner has many attempts; a problem has many attempts.
- An attempt has at most one submission (`attemptId` is unique).
- A submission has at most one feedback (`submissionId` is unique).

### Enums

- `Difficulty`: `EASY | MEDIUM | HARD`
- `AttemptStatus`: `IN_PROGRESS | SUBMITTED | COMPLETED`
- `SubmissionFormat`: `TEXT | CODE`
- `FeedbackStatus`: `PENDING | COMPLETED | FAILED`
- `EvaluatorType`: `RULE_BASED | LLM`

### State machine for an attempt

```
IN_PROGRESS ──(submit)──▶ SUBMITTED ──(evaluation done)──▶ COMPLETED
```

`Feedback` mirrors this asynchronously: `PENDING → COMPLETED | FAILED`.

### Indexes

- `Learner.email` — unique lookup during sign-in.
- `Problem.slug` — unique, human-readable URL key.
- `Attempt(learnerId, problemId)` and `Attempt(problemId)` — fast lookups for "my attempts" and per-problem history.
- `Submission.attemptId` and `Feedback.submissionId` — unique one-to-one joins.

## 4. API design

The API is versioned under `/api/v1` and follows REST conventions.

- **Resource-oriented URLs** (`/learners`, `/problems`, `/attempts`, `/submissions`, `/feedback`).
- **Nested lookups** for common queries: `/attempts/learners/:learnerId/attempts` and `/attempts/learners/:learnerId/problems/:problemId`.
- **Consistent JSON envelope** — responses carry a `message` plus the payload (e.g. `{ message: "Problems retrieved successfully", problems: [...] }`).
- **Status codes** — `201` for creation, `200` for reads, `400` for validation, `404` for missing resources, `500` for unexpected errors.

### A note on feedback-by-attempt lookup

Because a submission is optional on an attempt, `GET /feedback/attempt/:attemptId` first resolves the attempt's submission, then the submission's feedback. This keeps the frontend able to poll feedback using only the attempt id (which is what it navigates with).

## 5. Evaluation subsystem

The evaluation pipeline is the core of the product and is deliberately decoupled from HTTP.

### Interfaces (evaluation/types.ts)

```ts
interface EvaluationInput  { problem: {...}; submission: { content, format } }
interface EvaluationResult { score, summary, strengths[], issues[], suggestions[], reasoning }
interface Evaluator { readonly type; evaluate(input): Promise<EvaluationResult> }
```

### RuleBasedEvaluator

Deterministic scoring across six dimensions (total 100):

| Dimension | Max | Heuristic |
| --- | --- | --- |
| Content | 10 | submission is non-empty |
| Entities | 20 | regex count of `class`/`interface`/`enum`/`record` declarations |
| Relationships | 15 | presence of terms like `extends`, `implements`, `has-a`, `is-a` |
| Responsibilities | 15 | presence of `method`, `function`, `responsib`, `encapsulat`, `behavior` |
| Principles | 20 | presence of SOLID terms (`srp`, `ocp`, `lsp`, `isp`, `dip`, …) |
| Requirements | 20 | keyword-overlap between the submission and each stated requirement (stop-word filtered) |

It also generates human-readable `strengths`, `issues`, `suggestions`, and a line-by-line `reasoning` breakdown.

### LLMEvaluator

Sends the problem (title, description, requirements) and the solution to `gpt-4o-mini` with a system prompt that:

- Frames the model as a senior reviewer.
- Explicitly acknowledges multiple valid designs.
- Requests **strict JSON** output with a fixed shape (`summary`, `strengths[]`, `issues[]`, `suggestions[]`, `reasoning`).

### EvaluationService (orchestration)

1. Load the submission with its attempt and problem.
2. Run the rule-based evaluator (always).
3. Attempt the LLM evaluator:
   - **Success** → merge: keep the rule-based score and strengths/issues; use the LLM summary/suggestions and append the LLM reasoning. Tag evaluator as `LLM`.
   - **Failure** → keep the rule-based result and append a note explaining the LLM was skipped.
4. Persist the final `Feedback` as `COMPLETED` and mark the attempt `COMPLETED`.

This hybrid design guarantees a score is always produced (rule-based) while enriching it with AI when available.

### Why asynchronous

The LLM call can take seconds, which is too long to block an HTTP response. The controller fires `evaluationService.evaluateSubmission(...)` without awaiting it, returns `201` immediately, and the frontend polls for the result.

## 6. Frontend design

- **Routing** (`App.tsx`): `/`, `/problems`, `/problems/:id`, `/my-attempts`, `/attempts/:id`.
- **Auth state** (`context/LearnerProvider.tsx`): a `LearnerContext` holds the current learner and persists it to `localStorage`. An `AuthModal` gates the app when no learner is present.
- **Service layer** (`services/*.ts`): a single configured Axios instance (`api.ts`, base URL `http://localhost:3000/api/v1`) with one module per resource. Pages never call `fetch`/Axios directly.
- **Feedback polling** (`pages/AttemptDetail.tsx`): after submission, the page polls `GET /feedback/attempt/:attemptId` every 1.5s (bounded) until the status is terminal, then renders score, strengths, issues, suggestions, and reasoning.
- **Progress history**: the attempt detail page also fetches all attempts for the same learner+problem to render an "Attempt N" progress list with per-attempt scores.

### Typing

Shared domain types are declared in `frontend/src/types/index.ts`; pages define local view-model interfaces for shapes returned by the API.

## 7. Key design decisions and trade-offs

| Decision | Trade-off |
| --- | --- |
| Hybrid rule + LLM scoring | Deterministic score is guaranteed, but the LLM review is non-deterministic and depends on an external service. |
| Optional LLM (no API key required) | The product degrades gracefully to rule-only scoring at the cost of less nuanced feedback. |
| Polling instead of WebSockets | Simpler and robust; adds up-to-1.5s latency and some request overhead. |
| Context instead of Redux | Minimal global state, but would need revisiting if state grows. |
| Email lookup + scrypt instead of full JWT | Fast to build and secure enough for a practice app; lacks real session management (deferred). |
| Postgres array columns for `requirements`/`strengths`/etc. | Simple and avoids join tables for small lists; harder to query individual elements. |

## 8. Security considerations

- Passwords are hashed with `scrypt` and a random per-user salt; plaintext passwords are never stored or returned (a `toSafeLearner` helper strips the field).
- CORS is restricted to the frontend origin (`http://localhost:5173`).
- Secrets are loaded via `dotenv` and the `.env` file is git-ignored.
- `OPENAI_API_KEY` is read server-side only and never exposed to the client.

**Known gaps (future work):** no rate limiting, no input-size limits on submissions, no token-based authentication, and the email-lookup endpoint currently reveals learner existence (an information-disclosure concern for a production system).

## 9. Known limitations and future work

- No automated tests (unit/integration) — evaluators are the highest-value target for unit tests.
- Polling should be replaced with SSE or WebSockets for a snappier feedback loop.
- No problem seeding script or admin UI.
- LLM output is not yet persisted separately from the rule-based result (a single merged `Feedback` record).
- No pagination on `GET /problems` and `GET /attempts/...`.
