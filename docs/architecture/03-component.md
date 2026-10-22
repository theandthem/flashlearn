# FlashLearn — C4 Level 3: Component (API Application)

> **What this shows:** the internal components of the **API Application**
> container and how a request flows through the layers
> (Controller → Service → Repository). The SPA, Database and LLM stay as
> context boxes — they are not opened up at this level.

```mermaid
C4Component
    title Component diagram — FlashLearn API Application

    Container(spa, "App", "React + TypeScript", "Browser UI for creating decks and reviewing cards/quizzes.")

    Container_Boundary(api, "API Application") {
        Component(deckController, "Deck Controller", "Spring @RestController", "Handles POST /decks/generate and GET /decks/{id}.")
        Component(quizController, "Quiz Controller", "Spring @RestController", "Handles POST /quiz/submit.")
        Component(deckService,    "Deck Service",    "Spring @Service",       "Orchestrates deck generation and persistence.")
        Component(quizEngine,     "Quiz Engine",     "Domain logic",          "Pure scoring logic: marks answers and computes the score.")
        Component(generation,     "Generation Service", "Spring AI",          "Builds prompts, calls the LLM, parses structured output.")
        Component(repositories,   "Repositories",    "Spring Data JPA",       "Reads and writes decks, flashcards and quiz data.")
    }

    ContainerDb(db, "Database", "PostgreSQL + pgvector", "Stores decks, flashcards, quiz questions and embeddings.")
    System_Ext(llm, "LLM Provider", "Generates flashcards and quizzes from source text.")

    Rel(spa, deckController, "Generates and fetches decks", "JSON/HTTPS")
    Rel(spa, quizController, "Submits quiz answers", "JSON/HTTPS")

    Rel(deckController, deckService, "Delegates deck generation")
    Rel(quizController, quizEngine,  "Requests answer scoring")

    Rel(deckService, generation,   "Requests card and quiz generation")
    Rel(deckService, repositories, "Saves and reads decks")
    Rel(quizEngine,  repositories, "Reads questions, saves results")

    Rel(generation, llm, "Sends structured prompt", "HTTPS/REST")
    Rel(repositories, db, "Persists and queries", "JDBC")
```
