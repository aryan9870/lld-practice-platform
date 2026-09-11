# LLD Practice Platform

A full-stack web application for practicing **Low-Level Design (LLD)**. Learners pick a design problem, submit their solution (as text or code), and receive automated, actionable feedback — a deterministic rule-based score combined with an optional LLM qualitative review.

## What it does

1. A learner signs in with a name, email, and password (or is auto-registered on first visit).
2. They browse a catalog of LLD problems, each with a description, difficulty, and a list of requirements.
3. They start an *attempt* on a problem, write a design solution, and submit it.
4. The backend evaluates the submission **asynchronously** using a hybrid pipeline:
   - **Rule-based evaluator** — deterministic scoring across six dimensions (content, entities, relationships, responsibilities, design principles, requirements coverage).
   - **LLM evaluator** — optional qualitative review using OpenAI (`gpt-4o-mini`) for a summary, strengths, and suggestions.
5. The learner sees a score out of 100, strengths, issues, suggestions, and detailed reasoning, along with their attempt history per problem.

## Tech stack

| Layer      | Technology                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| Frontend   | React 19, TypeScript, Vite, Tailwind CSS 4, React Router 7, Axios          |
| Backend    | Node.js, Express 5, TypeScript                                             |
| Database   | PostgreSQL, Prisma 7 (with the `@prisma/adapter-pg` driver adapter)        |
| Evaluation | Custom rule-based engine + OpenAI `gpt-4o-mini` (optional)                 |

## Architecture overview

```
┌─────────────────────┐          HTTP / JSON          ┌──────────────────────────┐
│      Frontend       │  ──────────────────────────▶ │         Backend          │
│  React + Vite SPA   │        (REST, /api/v1)       │  Express 5 + TypeScript  │
│  (localhost:5173)   │ ◀──────────────────────────  │  (localhost:3000)        │
└─────────────────────┘                               └────────────┬─────────────┘
                                                                    │  Prisma
                                                                    ▼
                                                          ┌──────────────────┐
                                                          │   PostgreSQL      │
                                                          └──────────────────┘
                                                                    ▲
                                                          ┌──────────────────┐
                                                          │ EvaluationService │
                                                          │  Rule-based + LLM │
                                                          └──────────────────┘
```

## Project structure

```
lld-practice-platform/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── app.ts                      # Express app, CORS, routes, server start
│   │   ├── db/db.ts                    # Prisma client (pg adapter)
│   │   ├── routes/                     # REST route definitions
│   │   ├── controllers/                # Request handlers
│   │   └── evaluation/                 # Evaluation subsystem
│   │       ├── types.ts                # Evaluator interface & shared types
│   │       ├── RuleBasedEvaluator.ts   # Deterministic scoring engine
│   │       ├── LLMEvaluator.ts         # OpenAI-based qualitative review
│   │       └── EvaluationService.ts    # Orchestrates the pipeline
│   └── package.json
└── frontend/
    ├── public/
    └── src/
        ├── components/                 # Navbar, ProblemCard, AuthModal
        ├── context/                    # LearnerProvider (auth state)
        ├── pages/                      # Home, Problems, ProblemDetail, AttemptDetail, MyAttempts
        ├── services/                   # API service layer (Axios)
        ├── types/                      # Shared TypeScript types
        ├── App.tsx                     # Routing & app shell
        └── index.css                   # Tailwind theme tokens
```

## Getting started

### Prerequisites

- Node.js 18+
- PostgreSQL (running locally or via a connection string)
- An OpenAI API key (optional — the platform works with rule-based evaluation alone)

### 1. Backend

```bash
cd backend
npm install

# Create a .env file with your database URL (see below)
cp .env.example .env   # or create .env manually

# Apply migrations and generate the Prisma client
npx prisma migrate deploy
npx prisma generate

# Start the dev server (port 3000)
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev   # starts Vite on http://localhost:5173
```

Open <http://localhost:5173> in your browser.

### Environment variables

Create a `backend/.env` file with the following:

```
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<database>"
OPENAI_API_KEY="sk-..."        # optional — enables the LLM qualitative review
```

> `OPENAI_API_KEY` is optional. Without it, the platform still scores every submission with the rule-based engine and marks the LLM review as skipped.

### Seeding problems

There is no seed script yet. Problems can be inserted directly into PostgreSQL, for example:

```sql
INSERT INTO "Problem" ("id", "title", "slug", "description", "requirements", "difficulty", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Design a Parking Lot',
  'design-a-parking-lot',
  'Design a parking lot that supports multiple vehicle types...',
  ARRAY['Support multiple vehicle types', 'Assign spots efficiently', 'Handle payment'],
  'MEDIUM',
  now(),
  now()
);
```

> Note: `gen_random_uuid()` requires the `pgcrypto` extension (`CREATE EXTENSION IF NOT EXISTS pgcrypto;`).

## API reference

Base URL: `http://localhost:3000/api/v1`

| Method | Endpoint                                            | Description                                        |
| ------ | --------------------------------------------------- | -------------------------------------------------- |
| GET    | `/health`                                           | Health check                                       |
| POST   | `/learners`                                         | Create a learner                                   |
| GET    | `/learners/email/:email`                            | Get a learner by email                             |
| GET    | `/problems`                                         | List all problems                                  |
| GET    | `/problems/:id`                                     | Get a single problem                               |
| POST   | `/attempts`                                         | Create an attempt (`learnerId`, `problemId`)       |
| GET    | `/attempts/:id`                                     | Get an attempt (includes problem, learner, submission) |
| GET    | `/attempts/learners/:learnerId/attempts`            | List a learner's attempts                          |
| GET    | `/attempts/learners/:learnerId/problems/:problemId` | List a learner's attempts for a specific problem   |
| POST   | `/submissions`                                      | Submit a solution (`attemptId`, `format`, `content`) |
| GET    | `/submissions/:id`                                  | Get a submission                                   |
| GET    | `/submissions/attempts/:attemptId`                  | Get a submission by attempt                        |
| GET    | `/feedback/submission/:submissionId`                | Get feedback by submission                         |
| GET    | `/feedback/attempt/:attemptId`                      | Get feedback by attempt                            |

## How evaluation works

When a submission is created, the backend:

1. Creates a `Submission` record and a `Feedback` record in `PENDING` state.
2. Marks the attempt `SUBMITTED`.
3. Runs the evaluation **asynchronously** (non-blocking).

The `EvaluationService`:

1. Runs the **rule-based evaluator** to produce a deterministic score.
2. Attempts the **LLM evaluator** for qualitative feedback.
3. If the LLM succeeds, it merges the LLM's summary/suggestions with the rule-based strengths/issues/score and tags the feedback as `LLM`.
4. If the LLM fails (e.g. no API key), it falls back to rule-based-only feedback and records why the LLM was skipped.
5. Updates the feedback to `COMPLETED` (or `FAILED` on error) and marks the attempt `COMPLETED`.

The frontend **polls** the feedback endpoint every 1.5s until the feedback is no longer `PENDING`.

### Rule-based scoring dimensions

| Dimension           | Max points | What it checks                                             |
| ------------------- | ---------- | ---------------------------------------------------------- |
| Content             | 10         | Non-empty submission                                       |
| Entities            | 20         | Class/interface/enum/record declarations                   |
| Relationships       | 15         | `extends`, `implements`, composition, association, etc.    |
| Responsibilities    | 15         | Methods, responsibilities, encapsulation, behavior         |
| Design principles   | 20         | SOLID terms (SRP, OCP, LSP, ISP, DIP)                      |
| Requirements coverage | 20       | Keyword overlap with each stated problem requirement       |

## Roadmap / future improvements

- JWT-based authentication and authorization (a `JWT_SECRET` is already reserved in the env).
- Problem seeding script and an admin UI.
- Replace polling with WebSockets or server-sent events (SSE).
- Persist LLM evaluation results as a distinct evaluator record.
- Support richer formats (e.g. Mermaid diagrams, UML).
- Unit and integration tests.
