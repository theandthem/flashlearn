package com.flashlearn.quiz;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Component;

/**
 * Pure scoring logic: given a deck's questions and the learner's chosen options,
 * works out which answers are correct and the overall score. No persistence or
 * framework dependencies, so it is fully unit-testable in isolation.
 */
@Component
public class QuizEngine {

    public QuizResult score(List<QuizQuestion> questions, Map<UUID, UUID> selectedOptionByQuestion) {
        List<QuestionOutcome> outcomes = new ArrayList<>();
        int correctCount = 0;

        for (QuizQuestion question : questions) {
            UUID selectedOptionId = selectedOptionByQuestion.get(question.getId());
            UUID correctOptionId = question.correctOption()
                    .map(QuizOption::getId)
                    .orElse(null);

            boolean correct = correctOptionId != null && correctOptionId.equals(selectedOptionId);
            if (correct) {
                correctCount++;
            }

            outcomes.add(new QuestionOutcome(
                    question.getId(), selectedOptionId, correctOptionId, correct));
        }

        int total = questions.size();
        int scorePercent = total == 0 ? 0 : Math.round((correctCount * 100.0f) / total);

        return new QuizResult(total, correctCount, scorePercent, outcomes);
    }
}
