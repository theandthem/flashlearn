package com.flashlearn.deck;

import com.flashlearn.deck.api.DeckResponse;
import com.flashlearn.deck.api.DeckSummary;
import com.flashlearn.deck.api.GenerateDeckRequest;
import com.flashlearn.scorm.ScormService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
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
    private final ScormService scormService;

    public DeckController(DeckService deckService, ScormService scormService) {
        this.deckService = deckService;
        this.scormService = scormService;
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

    @GetMapping("/{id}/scorm")
    public ResponseEntity<byte[]> exportScorm(@PathVariable UUID id) {
        ScormService.ScormPackage pkg = scormService.export(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + pkg.filename() + "\"")
                .contentType(MediaType.parseMediaType("application/zip"))
                .body(pkg.content());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        deckService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
