package com.flashlearn.deck;

import com.flashlearn.deck.api.DeckResponse;
import com.flashlearn.deck.api.DeckSummary;
import com.flashlearn.deck.api.GenerateDeckRequest;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/decks")
public class DeckController {

    private final DeckService deckService;

    public DeckController(DeckService deckService) {
        this.deckService = deckService;
    }

    @GetMapping
    public List<DeckSummary> list() {
        return deckService.listDecks();
    }

    @PostMapping("/generate")
    public ResponseEntity<DeckResponse> generate(@Valid @RequestBody GenerateDeckRequest request) {
        DeckResponse deck = deckService.generate(request.sourceText(), request.title());
        // 201 Created with a Location header pointing at the new resource.
        return ResponseEntity
                .created(URI.create("/decks/" + deck.id()))
                .body(deck);
    }

    @GetMapping("/{id}")
    public DeckResponse getById(@PathVariable UUID id) {
        return deckService.getById(id);
    }
}
