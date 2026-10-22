package com.flashlearn.search;

import com.flashlearn.deck.Deck;
import com.flashlearn.deck.DeckRepository;
import com.flashlearn.deck.api.DeckSummary;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Semantic search over past decks using pgvector. Each deck is embedded and
 * stored on creation; a natural-language query is embedded and matched by
 * vector similarity. Active only when an LLM provider is configured, since it
 * needs an embedding model.
 */
@Service
@ConditionalOnProperty(name = "flashlearn.generation.provider", havingValue = "openai")
public class SemanticSearchService {

    private static final String DECK_ID_KEY = "deckId";

    private final VectorStore vectorStore;
    private final DeckRepository deckRepository;

    public SemanticSearchService(VectorStore vectorStore, DeckRepository deckRepository) {
        this.vectorStore = vectorStore;
        this.deckRepository = deckRepository;
    }

    public void indexDeck(UUID deckId, String title, String sourceText) {
        Document document = Document.builder()
                .text(title + "\n\n" + sourceText)
                .metadata(Map.of(DECK_ID_KEY, deckId.toString()))
                .build();
        vectorStore.add(List.of(document));
    }

    @Transactional(readOnly = true)
    public List<DeckSummary> search(String query, int limit) {
        List<Document> hits = vectorStore.similaritySearch(
                SearchRequest.builder().query(query).topK(limit).build());

        List<UUID> orderedIds = hits.stream()
                .map(doc -> doc.getMetadata().get(DECK_ID_KEY))
                .filter(Objects::nonNull)
                .map(Object::toString)
                .map(UUID::fromString)
                .toList();

        // Load in one query, then restore similarity order from the vector search.
        Map<UUID, Deck> byId = deckRepository.findAllById(orderedIds).stream()
                .collect(Collectors.toMap(Deck::getId, Function.identity()));

        return orderedIds.stream()
                .map(byId::get)
                .filter(Objects::nonNull)
                .map(DeckSummary::from)
                .toList();
    }
}
