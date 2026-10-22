package com.flashlearn.generation;

import java.util.List;

/**
 * Framework-agnostic description of generated learning content, decoupled from
 * JPA entities. The AI adapter (Phase 3) produces this; the service maps it to
 * domain objects. Keeping this separate means the domain never depends on the LLM.
 */
public record GeneratedDeck(
        String title,
        List<GeneratedFlashcard> flashcards,
        List<GeneratedQuizQuestion> quizQuestions) {

    public record GeneratedFlashcard(String question, String answer, String explanation) {
    }

    public record GeneratedQuizQuestion(String question, List<GeneratedOption> options) {
    }

    public record GeneratedOption(String text, boolean correct) {
    }
}
