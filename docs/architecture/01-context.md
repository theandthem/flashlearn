# FlashLearn — C4 Level 1: System Context

> **What this shows:** who interacts with FlashLearn and the external systems it
> depends on. FlashLearn is a single opaque box here — internal structure
> (React, Spring Boot, Postgres) belongs in Level 2 (Container).

```mermaid
C4Context
    title System Context — FlashLearn

    Person(author,  "Author", "Inputs source text to create the flashcard deck using AI.")
    Person(learner, "Learner", "Views, answers questions and learns from the flashcard deck.")

    System(flashlearn, "FlashLearn", "Converts raw text into flashcards and quizzes.")

    System_Ext(llm, "LLM Provider", "Used to convert the raw text to flashcards and quizzes.")

    Rel(author,  flashlearn, "Pastes text to convert to flashcards and quizzes.")
    Rel(learner, flashlearn, "Views flashcards and quizzes.")
    Rel(flashlearn, llm, "Sends raw text and receives flashcards and quizzes.", "HTTPS/REST")
```
