# Research Note

This document captures the research, technology choices, and decisions made while building the LLD Practice Platform. Each section explains the options considered, the decision taken, and the reasoning.

## 1. Backend framework: Express vs. alternatives

**Options considered:** Express 5, NestJS, Fastify.

**Decision:** Express 5.

**Reasoning:**
- Express is the de facto standard for small-to-medium REST APIs and has the largest ecosystem of middleware and documentation.
- The domain (a focused practice platform) does not need the heavier structure and dependency-injection machinery that NestJS imposes.
- Fastify is faster but adds little benefit at this scale, and Express keeps the code approachable for reviewers.
- Express 5 was chosen to stay on the current major version (native `async` error handling, modern routing).

## 2. ORM / data access: Prisma vs. raw SQL vs. TypeORM

**Options considered:** Prisma, TypeORM, raw `pg` queries, Drizzle.

**Decision:** Prisma 7 with the `@prisma/adapter-pg` driver adapter.

**Reasoning:**
- A type-safe schema and auto-generated client remove a whole class of bugs (typos, invalid field access) and keep the code self-documenting.
- Prisma migrations give us reproducible, versioned schema changes (four migrations in the repo).
- Prisma 7 introduced a **driver-adapter architecture**: instead of a bundled query engine, it uses the native `pg` driver through `@prisma/adapter-pg`. This is lighter-weight and more transparent than the classic Rust engine.
- Prisma 7 also changed the generator to `prisma-client` (output to `generated/prisma`) and moved connection details into `prisma7.config.ts` — this was researched specifically because the v7 API differs significantly from v4/v5/v6 tutorials.

Key v7 findings applied in the project:
- `datasource db { provider = "postgresql" }` with **no `url`** in the schema — the URL now lives in `prisma7.config.ts` via `env("DATABASE_URL")`.
- The client is instantiated with a driver adapter:
  ```ts
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });
  ```

## 3. Frontend: React + Vite + Tailwind

**Options considered:** React vs. Vue vs. Svelte; Vite vs. CRA vs. Next.js; Tailwind vs. CSS modules vs. plain CSS.

**Decision:** React 19 + Vite + Tailwind CSS 4.

**Reasoning:**
- React has the largest hiring/learning overlap and the assignment context favors it.
- Vite gives fast dev builds and a minimal config surface.
- Tailwind 4 (via `@tailwindcss/vite`) allows a fully CSS-config-free theme; the brand palette (`cream`, `coral`, `ocean`, `ink`) is declared as CSS custom properties in `@theme`.
- A Next.js SSR app was unnecessary — the platform is a client-side SPA talking to a JSON API.

## 4. Routing and state management

**Options considered:** React Router vs. hand-rolled routing; Context API vs. Redux/Zustand.

**Decision:** React Router 7 for routing; React Context for the single piece of global state (the current learner).

**Reasoning:**
- The app has only five routes and a single global value (the signed-in learner). A full state library (Redux/Zustand) would be overkill.
- `LearnerProvider` persists the learner to `localStorage` so a refresh does not drop the session.

## 5. Evaluation strategy for LLD solutions

This was the most substantive research area. Low-Level Design answers are open-ended — there is no single correct answer — so grading is inherently subjective.

**Options considered:**

1. **Pure rule-based / heuristic scoring.** Deterministic, free, instant, but shallow (can be gamed, misses quality).
2. **Pure LLM grading.** Deep, contextual, flexible, but costly, slow, and non-deterministic.
3. **Hybrid (rule-based score + LLM qualitative review).** Combines a reproducible numeric score with human-quality commentary.

**Decision:** Hybrid approach (option 3).

**Reasoning:**
- A numeric score makes progress trackable and comparable across attempts; rules give it consistently and for free.
- LLM feedback adds the qualitative nuance (trade-offs, responsibilities, coherence) that rules cannot provide.
- Making the LLM **optional and non-blocking** means the core product works even without an API key, which improves reliability and reduces cost.

The rule-based evaluator scores six dimensions (content, entities, relationships, responsibilities, design principles, requirements coverage) with keyword/pattern heuristics. The LLM evaluator is prompted to return **strict JSON** and focus on coherence, abstractions, relationships, and trade-offs, acknowledging that multiple valid designs exist.

## 6. LLM integration details

**Options considered:** OpenAI Chat Completions, LangChain, a self-hosted model.

**Decision:** Direct call to OpenAI's `gpt-4o-mini` Chat Completions endpoint.

**Reasoning:**
- LangChain adds abstraction and dependencies for a single, well-defined call — unnecessary here.
- `gpt-4o-mini` balances cost, speed, and quality for short design reviews.
- `response_format: { type: "json_object" }` and a low `temperature` (0.3) improve output reliability and make the response easy to parse.
- The raw `fetch` call avoids another SDK dependency.

## 7. Authentication

**Options considered:** Full JWT flow, session cookies, simple email lookup.

**Decision:** Minimal email-based sign-in with scrypt password hashing (JWT planned).

**Reasoning:**
- The assignment's core value is the evaluation loop, not auth. A lightweight flow keeps scope tight.
- Passwords are hashed with `scrypt` (from `node:crypto`) using a per-user random salt, stored as `salt:hash`, and never returned by the API (a `toSafeLearner` helper strips the password).
- A `JWT_SECRET` is reserved in the environment for a future token-based flow.

## 8. Async evaluation & the frontend feedback loop

**Options considered:** Synchronous request/response, background job + polling, WebSockets/SSE.

**Decision:** Background evaluation + client polling (WebSockets/SSE deferred).

**Reasoning:**
- Synchronous evaluation would block the HTTP response on the (potentially slow) LLM call — poor UX.
- Polling every 1.5s (with a bounded retry loop) is simple, robust, and adequate for the current latency profile.
- WebSockets/SSE would remove polling overhead but add server and infra complexity; listed as future work.

## 9. CORS and environment configuration

- The backend allows only `http://localhost:5173` (the Vite dev server) to prevent arbitrary origins from calling the API.
- Configuration is centralized in `dotenv`-loaded environment variables (`.env`), which is git-ignored to avoid leaking secrets.

## References

- Prisma 7 driver adapters & config: <https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections>
- OpenAI Chat Completions (JSON mode): <https://platform.openai.com/docs/guides/structured-outputs>
- Node.js `scrypt`: <https://nodejs.org/api/crypto.html#cryptoscryptsyncpassword-salt-keylen-options>
- React Router 7: <https://reactrouter.com>
- Tailwind CSS 4 theme variables: <https://tailwindcss.com/docs/theme>
