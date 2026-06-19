package com.sba301.cinemaai.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sba301.cinemaai.recommendation.GeminiRecommendationStrategy;
import com.sba301.cinemaai.recommendation.MockRecommendationStrategy;
import com.sba301.cinemaai.recommendation.RecommendationStrategy;
import com.sba301.cinemaai.repository.ActorRepository;
import com.sba301.cinemaai.repository.GenreRepository;
import com.sba301.cinemaai.repository.MovieActorRepository;
import com.sba301.cinemaai.repository.MovieGenreRepository;
import com.sba301.cinemaai.service.GeminiChatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Registers exactly one {@link RecommendationStrategy} bean based on configuration:
 *
 * <ul>
 *   <li>{@code app.gemini.enabled=true}  → {@link GeminiRecommendationStrategy} (Gemini + rule-based fallback)</li>
 *   <li>{@code app.gemini.enabled=false} (default) → {@link MockRecommendationStrategy} (rule-based only)</li>
 * </ul>
 */
@Slf4j
@Configuration
public class RecommendationStrategyConfig {

    @Bean
    @ConditionalOnProperty(name = "app.gemini.enabled", havingValue = "false", matchIfMissing = true)
    public RecommendationStrategy mockRecommendationStrategy(
            MovieGenreRepository movieGenreRepository,
            MovieActorRepository movieActorRepository
    ) {
        log.info("Recommendation strategy: RULE-BASED (Gemini disabled)");
        return new MockRecommendationStrategy(movieGenreRepository, movieActorRepository);
    }

    @Bean
    @ConditionalOnProperty(name = "app.gemini.enabled", havingValue = "true")
    public RecommendationStrategy geminiRecommendationStrategy(
            GeminiChatService geminiChatService,
            GenreRepository genreRepository,
            ActorRepository actorRepository,
            MovieGenreRepository movieGenreRepository,
            MovieActorRepository movieActorRepository,
            ObjectMapper objectMapper
    ) {
        log.info("Recommendation strategy: GEMINI-ENHANCED (with rule-based fallback)");
        MockRecommendationStrategy fallback =
                new MockRecommendationStrategy(movieGenreRepository, movieActorRepository);
        return new GeminiRecommendationStrategy(
                geminiChatService,
                fallback,
                genreRepository,
                actorRepository,
                movieGenreRepository,
                objectMapper
        );
    }
}
