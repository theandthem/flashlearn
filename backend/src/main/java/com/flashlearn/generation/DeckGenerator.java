package com.flashlearn.generation;

/**
 * Port for turning raw source text into a generated deck. Implemented by the
 * Spring AI adapter in Phase 3; the rest of the app depends only on this seam.
 */
public interface DeckGenerator {

    GeneratedDeck generate(String sourceText);
}
