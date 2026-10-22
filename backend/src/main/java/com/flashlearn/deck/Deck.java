package com.flashlearn.deck;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import com.flashlearn.quiz.QuizQuestion;

@Entity
@Table(name = "decks")
public class Deck {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(name = "source_text", nullable = false)
    private String sourceText;

    @Generated(event = EventType.INSERT)
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "deck", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<Flashcard> flashcards = new ArrayList<>();

    @OneToMany(mappedBy = "deck", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<QuizQuestion> quizQuestions = new ArrayList<>();

    protected Deck() {
        // Required by JPA.
    }

    public Deck(String title, String sourceText) {
        this.title = title;
        this.sourceText = sourceText;
    }

    // Keeps both sides of the relationship consistent.
    public void addFlashcard(Flashcard flashcard) {
        flashcard.setDeck(this);
        flashcard.setPosition(flashcards.size());
        flashcards.add(flashcard);
    }

    public void addQuizQuestion(QuizQuestion question) {
        question.setDeck(this);
        question.setPosition(quizQuestions.size());
        quizQuestions.add(question);
    }

    public UUID getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getSourceText() {
        return sourceText;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public List<Flashcard> getFlashcards() {
        return flashcards;
    }

    public List<QuizQuestion> getQuizQuestions() {
        return quizQuestions;
    }
}
