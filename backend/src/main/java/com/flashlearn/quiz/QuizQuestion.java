package com.flashlearn.quiz;

import com.flashlearn.deck.Deck;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

@Entity
@Table(name = "quiz_questions")
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "deck_id", nullable = false)
    private Deck deck;

    @Column(nullable = false)
    private String question;

    @Column(nullable = false)
    private int position;

    @Generated(event = EventType.INSERT)
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<QuizOption> options = new ArrayList<>();

    protected QuizQuestion() {
        // Required by JPA.
    }

    public QuizQuestion(String question) {
        this.question = question;
    }

    public void addOption(QuizOption option) {
        option.setQuestion(this);
        option.setPosition(options.size());
        options.add(option);
    }

    // The single correct option, enforced unique at the DB level.
    public Optional<QuizOption> correctOption() {
        return options.stream().filter(QuizOption::isCorrect).findFirst();
    }

    public UUID getId() {
        return id;
    }

    public Deck getDeck() {
        return deck;
    }

    public void setDeck(Deck deck) {
        this.deck = deck;
    }

    public String getQuestion() {
        return question;
    }

    public int getPosition() {
        return position;
    }

    public void setPosition(int position) {
        this.position = position;
    }

    public List<QuizOption> getOptions() {
        return options;
    }
}
