package com.flashlearn.deck;

import com.flashlearn.common.ResourceNotFoundException;
import com.flashlearn.deck.api.DeckResponse;
import com.flashlearn.deck.api.DeckSummary;
import com.flashlearn.generation.DeckGenerator;
import com.flashlearn.generation.GeneratedDeck;
import com.flashlearn.quiz.QuizOption;
import com.flashlearn.quiz.QuizQuestion;
import com.flashlearn.search.SemanticSearchService;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Orchestrates deck generation and retrieval. Maps generated content onto the
 * domain model, delegates persistence to the repository, and returns API DTOs
 * mapped inside the transaction (OSIV is disabled, so lazy collections must be
 * read before the session closes).
 */
@Service
public class DeckService {

    private final DeckGenerator deckGenerator;
    private final DeckRepository deckRepository;
    // Optional: present only when semantic search is enabled (provider=openai).
    private final ObjectProvider<SemanticSearchService> semanticSearch;

    public DeckService(DeckGenerator deckGenerator, DeckRepository deckRepository,
            ObjectProvider<SemanticSearchService> semanticSearch) {
        this.deckGenerator = deckGenerator;
        this.deckRepository = deckRepository;
        this.semanticSearch = semanticSearch;
    }

    @Transactional
    public DeckResponse generate(String sourceText, String requestedTitle) {
        GeneratedDeck generated = deckGenerator.generate(sourceText);

        String title = (requestedTitle == null || requestedTitle.isBlank())
                ? generated.title()
                : requestedTitle;

        Deck deck = new Deck(title, sourceText);

        for (GeneratedDeck.GeneratedFlashcard card : generated.flashcards()) {
            deck.addFlashcard(new Flashcard(card.question(), card.answer(), card.explanation()));
        }

        for (GeneratedDeck.GeneratedQuizQuestion generatedQuestion : generated.quizQuestions()) {
            QuizQuestion question = new QuizQuestion(generatedQuestion.question());
            for (GeneratedDeck.GeneratedOption option : generatedQuestion.options()) {
                question.addOption(new QuizOption(option.text(), option.correct()));
            }
            deck.addQuizQuestion(question);
        }

        // saveAndFlush forces the INSERT now so the DB-generated created_at is read
        // back and available for the DTO mapping below (we are still inside the tx).
        Deck saved = deckRepository.saveAndFlush(deck);

        // Index for semantic search when enabled; a no-op otherwise.
        semanticSearch.ifAvailable(service ->
                service.indexDeck(saved.getId(), saved.getTitle(), saved.getSourceText()));

        return DeckResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public DeckResponse getById(UUID id) {
        Deck deck = deckRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deck not found: " + id));
        return DeckResponse.from(deck);
    }

    @Transactional(readOnly = true)
    public List<DeckSummary> listDecks() {
        return deckRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(DeckSummary::from)
                .toList();
    }

    @Transactional
    public void delete(UUID id) {
        if (!deckRepository.existsById(id)) {
            throw new ResourceNotFoundException("Deck not found: " + id);
        }
        deckRepository.deleteById(id);
    }
}
