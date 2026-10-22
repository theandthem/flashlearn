package com.flashlearn.generation;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Real generator backed by an LLM via Spring AI. Active only when
 * {@code flashlearn.generation.provider=openai}. Uses structured output so the
 * model's reply is mapped straight onto {@link GeneratedDeck} — no brittle
 * hand-parsing of free text.
 */
@Component
@ConditionalOnProperty(name = "flashlearn.generation.provider", havingValue = "openai")
public class SpringAiDeckGenerator implements DeckGenerator {

    private static final String SYSTEM_PROMPT = """
            You are a learning-design assistant. From the user's source text, produce:
            - a short descriptive deck title,
            - 5-10 flashcards, each with a concept question, a concise answer, and a
              deeper explanation,
            - 3-5 multiple-choice quiz questions, each with 3-4 plausible options where
              EXACTLY ONE option is marked correct.
            Base everything strictly on the provided text. Do not invent facts.
            """;

    private final ChatClient chatClient;

    public SpringAiDeckGenerator(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @Override
    public GeneratedDeck generate(String sourceText) {
        return chatClient.prompt()
                .system(SYSTEM_PROMPT)
                .user(user -> user.text("Source text:\n{text}").param("text", sourceText))
                .call()
                .entity(GeneratedDeck.class);
    }
}
