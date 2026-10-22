package com.flashlearn.deck.api;

import com.flashlearn.deck.Deck;
import com.flashlearn.deck.Flashcard;
import com.flashlearn.quiz.QuizOption;
import com.flashlearn.quiz.QuizQuestion;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * API view of a deck. Note the quiz options expose only id + text — never the
 * correct flag — so the answer key is not leaked to the client.
 */
public record DeckResponse(
        UUID id,
        String title,
        OffsetDateTime createdAt,
        List<FlashcardView> flashcards,
        List<QuizQuestionView> quizQuestions) {

    public record FlashcardView(UUID id, String question, String answer, String explanation) {
    }

    public record QuizQuestionView(UUID id, String question, List<QuizOptionView> options) {
    }

    public record QuizOptionView(UUID id, String text) {
    }

    public static DeckResponse from(Deck deck) {
        List<FlashcardView> cards = deck.getFlashcards().stream()
                .map(DeckResponse::toCardView)
                .toList();

        List<QuizQuestionView> questions = deck.getQuizQuestions().stream()
                .map(DeckResponse::toQuestionView)
                .toList();

        return new DeckResponse(deck.getId(), deck.getTitle(), deck.getCreatedAt(), cards, questions);
    }

    private static FlashcardView toCardView(Flashcard card) {
        return new FlashcardView(card.getId(), card.getQuestion(), card.getAnswer(), card.getExplanation());
    }

    private static QuizQuestionView toQuestionView(QuizQuestion question) {
        List<QuizOptionView> options = question.getOptions().stream()
                .map(DeckResponse::toOptionView)
                .toList();
        return new QuizQuestionView(question.getId(), question.getQuestion(), options);
    }

    private static QuizOptionView toOptionView(QuizOption option) {
        return new QuizOptionView(option.getId(), option.getOptionText());
    }
}
