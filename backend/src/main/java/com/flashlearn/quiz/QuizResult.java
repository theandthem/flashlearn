package com.flashlearn.quiz;

import java.util.List;

// The overall result of a submitted quiz attempt.
public record QuizResult(
        int totalQuestions,
        int correctCount,
        int scorePercent,
        List<QuestionOutcome> outcomes) {
}
