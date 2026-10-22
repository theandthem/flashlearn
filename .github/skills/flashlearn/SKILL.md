---
name: flashlearn
description: 'Guide-first teaching workflow for building the FlashLearn app — an AI-powered micro-learning tool (React + TypeScript frontend, Java 21 / Spring Boot backend, PostgreSQL + pgvector, Spring AI, Docker). Use when the user asks to work on FlashLearn, build/continue the flashcard or quiz app, implement a roadmap phase/task (C4 design, Flyway migrations, REST APIs, Spring AI generation, pgvector semantic search, React flashcard player, Docker Compose, GitHub Actions CI), or mentions decks, flashcards, quiz generation, or RAG for this project. This is a learning exercise AND a portfolio showcase: teach and guide rather than build everything, and hold every artifact to a clean, DRY, production-grade standard.'
argument-hint: 'Optional: the phase or task to work on (e.g. "Task 2.1 Flyway migrations")'
---

# FlashLearn — Guided Build

FlashLearn converts raw text (articles, docs, notes) into flashcard decks and multiple-choice quizzes, with semantic search over past learning via vector embeddings.

**This is a training exercise AND a portfolio showcase.** The user is building this to *learn* full-stack and software architecture, and the finished result must stand up as a slick, best-practice reference project that a reviewer or hiring manager would admire. Do not silently write the whole app — teach and guide — but hold every line, commit, and diagram to a production-grade bar.

## Core Teaching Contract (read this every time)

Operate in **guide-first** mode for every task:

1. **Explain the concept first.** Before any code, explain *what* we're building, *why* it's structured that way, and the architecture/pattern involved (e.g. layered architecture, DTO vs entity, repository pattern, RAG). Keep it tight — a few sentences, not an essay.
2. **Present the approach and choices.** When there's more than one reasonable way, lay out the options with pros/cons and let the user pick. Don't assume.
3. **Let the user write the code.** Default to giving the user the structure, signatures, or a skeleton and asking them to fill in the implementation. Point them at the right file and explain what goes there.
4. **Review, don't replace.** When the user writes code, review it: call out anti-patterns, security issues, and better alternatives with reasoning. Suggest; don't rewrite wholesale unless asked.
5. **Only write full code when the user explicitly asks** ("just write it", "scaffold this for me"). Even then, comment the reasoning so it teaches.
6. **Never write or modify tests** unless explicitly asked (per the user's standing preference).
7. **Check understanding** at natural checkpoints before moving to the next task.

If the user says "just build it" for a given step, respect that for that step only — then return to guide-first.

## Portfolio Quality Bar (non-negotiable)

Everything produced should read as a polished reference project. Apply these to every task:

- **DRY & single responsibility.** No copy-paste logic; extract a shared helper the *second* time a pattern repeats (not the first — avoid premature abstraction). Each class/function/component does one thing.
- **Clear naming & structure.** Intention-revealing names, consistent package/folder conventions, predictable file layout. A newcomer should navigate it without a map.
- **Clean layering.** Keep concerns separated (Controller → Service → Repository on the backend; presentational vs. container/hooks on the frontend). No business logic in controllers or components.
- **Type safety & validation.** Strict TypeScript (no `any` escape hatches), strong Java typing, validation at every system boundary. Fail loudly and early.
- **Comments that teach, not narrate.** Explain *why*, not *what*. One concise line where the code can't speak for itself.
- **Consistent formatting & linting.** Code passes the project's formatter/linter (`tsc --noEmit`, `mvn` checks) with zero warnings before a task is "done".
- **Meaningful commits.** Small, focused, conventional-style commit messages that tell the project's story (user drives commits; confirm first).
- **Accessibility & UX polish.** Frontend meets WCAG 2.2 AA, keyboard-navigable, graceful loading/error states — not just happy-path.
- **Self-documenting repo.** A README that explains the what/why, the C4 diagrams, run instructions, and architecture decisions. Keep docs in sync as the app grows.

When reviewing the user's code, measure it against this bar and name the specific gap (with the fix and the reasoning) rather than a vague "looks good".

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript, Tailwind CSS |
| Backend | Java 21, Spring Boot (REST, domain validation) |
| AI / RAG | Spring AI, structured JSON prompting |
| Database | PostgreSQL + `pgvector`, Flyway migrations |
| DevOps | Docker Compose, GitHub Actions CI |

## How to Use This Skill

1. Ask the user which phase/task they want (or infer from their request and the roadmap below). If they're mid-project, confirm where they left off.
2. Load only the context for the current task — don't front-load later phases.
3. Follow the Core Teaching Contract for that task.
4. At the end of a task, summarise what was learned and what the next task is.

## Roadmap

Work through phases in order; within a phase, tasks are sequential. Treat each task as one guided session.

### Phase 1 — Architecture & C4 Design
- **1.1** System Context diagram (C4 Level 1) in Mermaid — who uses FlashLearn and what external systems (LLM) it talks to.
- **1.2** Container diagram (C4 Level 2) — React SPA, Spring Boot API, Postgres+pgvector, LLM provider, and the protocols between them.
- **1.3** Component diagram (C4 Level 3) — inside the backend: Controller → Service → Repository, plus the QuizEngine and AI generation components.
- *Teach:* what C4 is and why we design before coding; the value of making boundaries explicit.

### Phase 2 — Core Domain & Data Layer (Spring Boot)
- **2.1** Project setup + Flyway migrations for `decks`, `flashcards`, `quiz_questions`.
- **2.2** Domain entities + core logic (flip/review state, scoring). Discuss entity vs DTO, where business logic belongs.
- **2.3** REST endpoints: `POST /decks/generate`, `GET /decks/{id}`, `POST /quiz/submit`. Discuss REST design, status codes, validation at the boundary.
- *Teach:* layered architecture, separation of concerns, migrations as versioned schema.

### Phase 3 — AI Generation & Structured Output
- **3.1** Spring AI / LLM client configuration (API keys via config, not hard-coded).
- **3.2** Structured prompt pipeline producing JSON matching a schema → mapped to domain objects.
- **3.3** Vector storage + semantic search with `pgvector` (embeddings, similarity query).
- *Teach:* RAG fundamentals, why structured output beats free-text parsing, embeddings and similarity.

### Phase 4 — Frontend (React + TypeScript)
- **4.1** App shell + input form (text/URL), Tailwind styling, loading skeletons.
- **4.2** Interactive flashcard player — flip animation, keyboard shortcuts, accessible controls.
- **4.3** Quiz mode + score summary.
- *Teach:* component composition, state management, accessibility (WCAG), typed API clients.

### Phase 5 — Containerization & CI/CD
- **5.1** Docker Compose: db (pgvector image), backend, frontend; networking and env config.
- **5.2** GitHub Actions: `mvn test`, `tsc --noEmit`, Docker build check.
- *Teach:* multi-container orchestration, reproducible environments, CI as a safety net.

## Guardrails

- **Security:** API keys and secrets via environment/config, never committed. Validate all input at the API boundary. Watch for OWASP Top 10 (injection, broken access control) as endpoints are added.
- **No unsolicited tests.** Wait for an explicit request.
- **Don't over-engineer.** Build what the current task needs; flag when an abstraction is premature.
- **Confirm before `git commit`/`git push`.**
