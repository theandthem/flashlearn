package com.flashlearn.search;

import com.flashlearn.deck.api.DeckSummary;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;

@RestController
@Validated
// Only registered when semantic search is active, matching SemanticSearchService.
@ConditionalOnProperty(name = "flashlearn.generation.provider", havingValue = "openai")
public class SearchController {

    private final SemanticSearchService semanticSearchService;

    public SearchController(SemanticSearchService semanticSearchService) {
        this.semanticSearchService = semanticSearchService;
    }

    // Literal /decks/search is matched ahead of /decks/{id}, so no routing clash.
    @GetMapping("/decks/search")
    public List<DeckSummary> search(
            @RequestParam @NotBlank String q,
            @RequestParam(defaultValue = "5") @Min(1) @Max(20) int limit) {
        return semanticSearchService.search(q, limit);
    }
}
