package com.flashlearn.quiz;

import java.util.List;
import java.util.UUID;

// Outcome of scoring a single question.
public record QuestionOutcome(
        UUID questionId,
        UUID selectedOptionId,
        UUID correctOptionId,
        boolean correct) {
}
