package com.flashlearn.quiz.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

// Request body for POST /quiz/submit.
public record SubmitQuizRequest(
        @NotNull UUID deckId,
        @NotEmpty List<@Valid Answer> answers) {

    public record Answer(
            @NotNull UUID questionId,
            @NotNull UUID selectedOptionId) {
    }
}
