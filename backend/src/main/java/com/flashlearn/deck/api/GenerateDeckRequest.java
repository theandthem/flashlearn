package com.flashlearn.deck.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Request body for POST /decks/generate. Validated at the controller boundary.
public record GenerateDeckRequest(
        @NotBlank @Size(max = 20_000) String sourceText,
        @Size(max = 200) String title) {
}
