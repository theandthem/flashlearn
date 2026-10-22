# ⚡ FlashLearn

An AI-powered micro-learning app that turns any article, documentation, or notes
into interactive **flashcards** and a **multiple-choice quiz** — with semantic
search over your past decks via vector embeddings.

- **Frontend:** React + TypeScript, Tailwind CSS (Vite)
- **Backend:** Java 21, Spring Boot (REST, layered architecture)
- **AI / RAG:** Spring AI + OpenAI, structured JSON output, pgvector semantic search
- **Database:** PostgreSQL + `pgvector`, Flyway migrations
- **Platform:** Docker Compose, GitHub Actions CI

---

## Architecture

Designed top-down with the [C4 model](https://c4model.com):

| Level | Diagram |
|-------|---------|
| 1 — System Context | [docs/architecture/01-context.md](docs/architecture/01-context.md) |
| 2 — Container | [docs/architecture/02-container.md](docs/architecture/02-container.md) |
| 3 — Component (API) | [docs/architecture/03-component.md](docs/architecture/03-component.md) |

Request flow in the backend follows a clean layered path:

```
Controller → Service → Repository → PostgreSQL
                 │
                 ├── DeckGenerator (Spring AI)  → LLM
                 └── QuizEngine (pure scoring logic)
```

---

## Project structure

```
flash-learn/
├── backend/      Spring Boot API (Java 21, Maven wrapper)
├── frontend/     React + TypeScript SPA (Vite, Tailwind)
├── docs/         C4 architecture diagrams
└── docker-compose.yml
```

---

## Running it

### Everything in Docker (one command)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Database: pgvector Postgres (internal to the Compose network)

By default the backend uses a **stub generator**, so it runs with no API key.
To use the real LLM:

```bash
GENERATION_PROVIDER=openai OPENAI_API_KEY=sk-... docker compose up --build
```

### Local development

```bash
# 1. Database
docker run -d --name flashlearn-db -p 5432:5432 \
  -e POSTGRES_USER=flashlearn -e POSTGRES_PASSWORD=flashlearn -e POSTGRES_DB=flashlearn \
  pgvector/pgvector:pg16

# 2. Backend (http://localhost:8080) — requires JDK 21
cd backend && ./mvnw spring-boot:run

# 3. Frontend (http://localhost:5173) — proxies /decks and /quiz to the backend
cd frontend && npm install && npm run dev
```

---

## API

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/decks/generate` | Generate a deck from source text |
| `GET`  | `/decks/{id}` | Fetch a deck |
| `POST` | `/quiz/submit` | Score a quiz attempt |
| `GET`  | `/decks/search?q=` | Semantic search (requires `provider=openai`) |

---

## Skills & concepts in this project

A map of what each part demonstrates, if you want to dig deeper.

### Architecture & design
- **C4 modelling** — communicating architecture at increasing zoom levels (context → container → component) before writing code.
- **Layered architecture** — Controller / Service / Repository separation; each layer talks only to the one below.
- **Ports & adapters** — the `DeckGenerator` interface isolates the LLM behind one seam, so the domain never depends on a third party (and it's swappable/mockable).
- **Pure domain logic** — `QuizEngine` has no DB or framework dependencies, making scoring trivially testable.

### Backend (Java / Spring Boot)
- **Flyway migrations** — schema as versioned, reproducible SQL (`V1`, `V2`); immutable once applied.
- **JPA / Hibernate mapping** — entities, relationships (`@OneToMany`/`@ManyToOne`), cascade, ordering; `@Generated` + `saveAndFlush` to read DB-generated values back.
- **DTOs vs entities** — the API never exposes entities; quiz option responses deliberately omit the correct flag so the answer key can't leak.
- **Boundary validation** — Jakarta Bean Validation (`@NotBlank`, `@Valid`) with automatic `400`s.
- **Transactions & OSIV** — `open-in-view=false` and mapping inside the transaction to avoid lazy-loading pitfalls.
- **Conditional beans** — `@ConditionalOnProperty` to swap the stub/real generator and gate semantic-search beans.

### AI / RAG
- **Structured output** — Spring AI maps the LLM reply straight onto a typed record, instead of brittle text parsing.
- **Prompt design** — a system prompt constraining the model to the source text and a strict output shape.
- **Vector search (pgvector)** — embeddings stored in a `vector` column with an HNSW cosine index; natural-language queries matched by similarity.

### Database
- **Relational modelling** — normalised tables, foreign keys with `ON DELETE CASCADE`, explicit FK indexes.
- **DB-enforced invariants** — a partial unique index guarantees exactly one correct option per question, independent of application code.

### Frontend (React / TypeScript)
- **Component composition & state** — a stage machine (`input → flashcards → quiz → score`) in `App`.
- **Typed API client** — a single typed contract (`types.ts` + `client.ts`) shared across the app.
- **Accessibility (WCAG 2.2 AA)** — semantic elements, labelled inputs, `fieldset`/`legend` radio groups, `aria-live` announcements, `aria-pressed` flip state, visible focus, keyboard shortcuts, and reduced-motion support.
- **Tailwind CSS** — utility-first styling plus a small custom 3D card-flip.

### Platform & DevOps
- **Multi-stage Docker builds** — build with the JDK/Node, ship a slim JRE/nginx image.
- **Docker Compose** — orchestrating db + backend + frontend, health checks, a named volume for persistence, and an nginx reverse proxy.
- **GitHub Actions CI** — `mvn test` (with a pgvector service), `tsc --noEmit` + build, and a Docker build check.
