package com.flashlearn.quiz;

import com.flashlearn.common.ResourceNotFoundException;
import com.flashlearn.deck.Deck;
import com.flashlearn.deck.DeckRepository;
import com.flashlearn.quiz.api.SubmitQuizRequest;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Loads a deck's questions and delegates to the pure {@link QuizEngine} for
 * scoring. Runs read-only inside a transaction so the lazy option collections
 * are available to the engine.
 */
@Service
public class QuizService {

    private final DeckRepository deckRepository;
    private final QuizEngine quizEngine;

    public QuizService(DeckRepository deckRepository, QuizEngine quizEngine) {
        this.deckRepository = deckRepository;
        this.quizEngine = quizEngine;
    }

    @Transactional(readOnly = true)
    public QuizResult submit(SubmitQuizRequest request) {
        Deck deck = deckRepository.findById(request.deckId())
                .orElseThrow(() -> new ResourceNotFoundException("Deck not found: " + request.deckId()));

        Map<UUID, UUID> selectedByQuestion = request.answers().stream()
                .collect(Collectors.toMap(
                        SubmitQuizRequest.Answer::questionId,
                        SubmitQuizRequest.Answer::selectedOptionId));

        return quizEngine.score(deck.getQuizQuestions(), selectedByQuestion);
    }
}
