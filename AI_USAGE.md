# AI Usage Disclosure

This document honestly describes how AI-assisted tools were used during the development of the LLD Practice Platform, what I used them for, what I did myself, and how I verified the results. It is intended for the assignment review.

## Tools used

- **ChatGPT / Claude** (conversational assistants) — for brainstorming, explaining concepts, and drafting code snippets.
- **GitHub Copilot / Cursor** (inline code completion) — for boilerplate and repetitive code.
- **AI-assisted search** — for tracking down recent API changes (notably Prisma 7) that older documentation did not cover.

## What I used AI for

1. **Learning unfamiliar APIs.** The largest source of help was understanding **Prisma 7**, whose driver-adapter model, `prisma-client` generator, and `prisma7.config.ts` differ significantly from the Prisma v4/v5 tutorials. I used AI to summarize the migration steps, then verified against the official docs and by running the code.

2. **Boilerplate and scaffolding.** Initial project setup (Vite + React + Tailwind, Express + TypeScript, ESLint config) is largely templated; AI helped generate this quickly rather than hand-typing it.

3. **Debugging.** When I hit type errors, Prisma client issues, or React state bugs, I pasted error messages and stack traces and used the AI's explanations to locate the root cause. I did not blindly apply fixes — I read and understood each change.

4. **Design feedback.** I described the evaluation strategy (rule-based scoring dimensions, LLM prompting, async pipeline) and used AI as a sounding board to weigh trade-offs (e.g., polling vs. WebSockets, hybrid scoring vs. pure LLM).

5. **Writing and polishing documentation.** AI helped structure and phrase these notes (`README`, `RESEARCH_NOTE`, `DESIGN_NOTE`) and clean up comments/commit messages.

## What I did myself

- **Designed the domain model.** The `Learner` / `Problem` / `Attempt` / `Submission` / `Feedback` schema, the enums, and the one-to-one relationships were my own decisions, informed by the assignment requirements.
- **Wrote the core evaluation logic.** The six-dimension rule-based scoring, the requirement-coverage heuristic, and the hybrid rule+LLM merge in `EvaluationService` are my own implementation, refined through testing.
- **Built the frontend flow.** Routing, the learner context, the attempt lifecycle, and the feedback polling loop were implemented and integrated by me.
- **Verified everything end-to-end.** I ran the backend and frontend locally, exercised the sign-in → browse → attempt → submit → feedback loop, and confirmed the rule-based evaluator and the LLM fallback both behaved correctly.

## How I verified AI output

- I never accepted a suggestion I couldn't explain. For each non-trivial change, I traced what it did and why.
- I cross-checked AI claims against official documentation (Prisma, OpenAI, React Router, Tailwind) rather than trusting them at face value.
- I tested behavior at runtime (API responses, scores, frontend rendering) rather than relying on "it compiles."
- I wrote and reviewed the domain logic myself, so AI-generated code was limited to well-understood scaffolding and helper code.

## Reflection

Using AI accelerated the boring parts (scaffolding, repetitive UI, API-lookup) so I could focus on the interesting, hard parts — the evaluation engine and the product flow. The main risk I guarded against was over-relying on AI for Prisma 7, where much of the training data reflects older versions; I learned to verify against primary sources. Overall, AI was a tutor and a pair-programmer, not a replacement for understanding the system I built.
