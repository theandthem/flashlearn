package com.flashlearn.scorm;

import com.flashlearn.deck.Deck;
import java.util.List;

/**
 * Flattened, serialisable view of a deck for the SCORM SCO. Unlike the web API,
 * this intentionally includes the correct flag because SCORM scores client-side.
 */
record ScormDeckDto(String title, List<Card> cards, List<Question> questions) {

    record Card(String question, String answer, String explanation) {
    }

    record Question(String text, List<Option> options) {
    }

    record Option(String text, boolean correct) {
    }

    static ScormDeckDto from(Deck deck) {
        List<Card> cards = deck.getFlashcards().stream()
                .map(c -> new Card(c.getQuestion(), c.getAnswer(), c.getExplanation()))
                .toList();

        List<Question> questions = deck.getQuizQuestions().stream()
                .map(q -> new Question(
                        q.getQuestion(),
                        q.getOptions().stream()
                                .map(o -> new Option(o.getOptionText(), o.isCorrect()))
                                .toList()))
                .toList();

        return new ScormDeckDto(deck.getTitle(), cards, questions);
    }
}
