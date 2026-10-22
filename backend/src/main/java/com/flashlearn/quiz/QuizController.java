package com.flashlearn.quiz;

import com.flashlearn.quiz.api.SubmitQuizRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/quiz")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping("/submit")
    public QuizResult submit(@Valid @RequestBody SubmitQuizRequest request) {
        return quizService.submit(request);
    }
}
