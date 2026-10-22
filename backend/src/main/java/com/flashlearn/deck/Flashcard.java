package com.flashlearn.deck;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

@Entity
@Table(name = "flashcards")
public class Flashcard {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "deck_id", nullable = false)
    private Deck deck;

    @Column(nullable = false)
    private String question;

    @Column(nullable = false)
    private String answer;

    @Column
    private String explanation;

    @Column(nullable = false)
    private int position;

    @Generated(event = EventType.INSERT)
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected Flashcard() {
        // Required by JPA.
    }

    public Flashcard(String question, String answer, String explanation) {
        this.question = question;
        this.answer = answer;
        this.explanation = explanation;
    }

    public UUID getId() {
        return id;
    }

    public Deck getDeck() {
        return deck;
    }

    void setDeck(Deck deck) {
        this.deck = deck;
    }

    public String getQuestion() {
        return question;
    }

    public String getAnswer() {
        return answer;
    }

    public String getExplanation() {
        return explanation;
    }

    public int getPosition() {
        return position;
    }

    void setPosition(int position) {
        this.position = position;
    }
}
