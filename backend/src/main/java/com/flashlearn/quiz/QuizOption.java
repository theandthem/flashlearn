package com.flashlearn.quiz;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "quiz_options")
public class QuizOption {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private QuizQuestion question;

    @Column(name = "option_text", nullable = false)
    private String optionText;

    @Column(name = "is_correct", nullable = false)
    private boolean correct;

    @Column(nullable = false)
    private int position;

    protected QuizOption() {
        // Required by JPA.
    }

    public QuizOption(String optionText, boolean correct) {
        this.optionText = optionText;
        this.correct = correct;
    }

    public UUID getId() {
        return id;
    }

    public QuizQuestion getQuestion() {
        return question;
    }

    void setQuestion(QuizQuestion question) {
        this.question = question;
    }

    public String getOptionText() {
        return optionText;
    }

    public boolean isCorrect() {
        return correct;
    }

    public int getPosition() {
        return position;
    }

    void setPosition(int position) {
        this.position = position;
    }
}
