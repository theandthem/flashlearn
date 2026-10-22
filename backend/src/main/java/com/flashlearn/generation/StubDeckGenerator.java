package com.flashlearn.generation;

import java.util.Arrays;
import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Deterministic placeholder generator so the app runs without an LLM key
 * (local dev, CI, frontend work). Replaced by the Spring AI adapter when
 * {@code flashlearn.generation.provider=openai}.
 */
@Component
@ConditionalOnProperty(name = "flashlearn.generation.provider", havingValue = "stub", matchIfMissing = true)
public class StubDeckGenerator implements DeckGenerator {

    @Override
    public GeneratedDeck generate(String sourceText) {
        String title = "Sample deck (" + Math.min(sourceText.length(), 40) + " chars)";

        List<GeneratedDeck.GeneratedFlashcard> cards = List.of(
                new GeneratedDeck.GeneratedFlashcard(
                        "What is this deck generated from?",
                        "The pasted source text.",
                        "The stub generator echoes the input length for demonstration."),
                new GeneratedDeck.GeneratedFlashcard(
                        "How is the real content produced?",
                        "By the Spring AI adapter.",
                        "Enable it with flashlearn.generation.provider=openai and an API key."));

        List<GeneratedDeck.GeneratedQuizQuestion> questions = List.of(
                new GeneratedDeck.GeneratedQuizQuestion(
                        "Which generator produced this deck?",
                        Arrays.asList(
                                new GeneratedDeck.GeneratedOption("The stub generator", true),
                                new GeneratedDeck.GeneratedOption("A real LLM", false),
                                new GeneratedDeck.GeneratedOption("A human author", false))));

        return new GeneratedDeck(title, cards, questions);
    }
}
