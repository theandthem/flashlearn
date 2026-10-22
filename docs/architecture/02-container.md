# FlashLearn — C4 Level 2: Container

> **What this shows:** the major building blocks *inside* FlashLearn — each a
> separately runnable app or data store — their technologies, and how they
> communicate. Actors and the LLM carry over from Level 1. Internal class/
> component detail belongs in Level 3 (Component).


```mermaid
C4Container
    title Container diagram — FlashLearn

    Person(author,  "Author", "Inputs source text to create the flashcard deck using AI.")
    Person(learner, "Learner", "Views, answers questions and learns from the flashcard deck.")

    System_Boundary(flashlearn, "FlashLearn") {
        Container(spa,  "App", "React + TypeScript, Tailwind", "UI to author flashcard decks and display them to learners.")
        Container(api,  "API", "Java 21, Spring Boot", "REST endpoints, domain logic; orchestrates AI generation and persistence.")
        ContainerDb(db, "Database", "PostgreSQL + pgvector", "Stores decks, flashcards, quiz questions and embeddings.")
    }

    System_Ext(llm, "LLM Provider", "Used to convert the raw text to flashcards and quizzes.")

    Rel(author,  spa, "Pastes source text", "HTTPS")
    Rel(learner, spa, "Views decks and takes quizzes", "HTTPS")
    Rel(spa, api, "Makes API calls", "JSON/HTTPS")
    Rel(api, db,  "Saves and reads data", "JDBC")
    Rel(api, llm, "Sends raw data for conversion", "HTTPS/REST")
```
