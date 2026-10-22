package com.flashlearn.deck.api;

import com.flashlearn.deck.Deck;
import java.time.OffsetDateTime;
import java.util.UUID;

// Lightweight deck view for search results (no cards/questions).
public record DeckSummary(UUID id, String title, OffsetDateTime createdAt) {

    public static DeckSummary from(Deck deck) {
        return new DeckSummary(deck.getId(), deck.getTitle(), deck.getCreatedAt());
    }
}
