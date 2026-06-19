package com.sba301.cinemaai.recommendation;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sba301.cinemaai.entity.Movie;
import com.sba301.cinemaai.repository.ActorRepository;
import com.sba301.cinemaai.repository.GenreRepository;
import com.sba301.cinemaai.repository.MovieActorRepository;
import com.sba301.cinemaai.repository.MovieGenreRepository;
import com.sba301.cinemaai.service.GeminiChatService;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Gemini-enhanced recommendation strategy.
 *
 * Flow:
 *  1. Pre-filter/score movie candidates with the rule-based MockRecommendationStrategy.
 *  2. Take the top {@value #PRE_FILTER_LIMIT} candidates and build a structured prompt.
 *  3. Send the prompt to Google Gemini to re-rank and explain recommendations.
 *  4. Merge Gemini's ranking back with the pre-scored candidates.
 *  5. On any error, gracefully fall back to the rule-based results.
 *
 * Not a Spring @Component — instantiated by {@link com.sba301.cinemaai.config.RecommendationStrategyConfig}.
 */
@Slf4j
public class GeminiRecommendationStrategy implements RecommendationStrategy {

    private static final int PRE_FILTER_LIMIT = 25;
    private static final int GEMINI_RANK_BONUS = 50;

    private final GeminiChatService geminiChatService;
    private final MockRecommendationStrategy fallback;
    private final GenreRepository genreRepository;
    private final ActorRepository actorRepository;
    private final MovieGenreRepository movieGenreRepository;
    private final ObjectMapper objectMapper;

    public GeminiRecommendationStrategy(
            GeminiChatService geminiChatService,
            MockRecommendationStrategy fallback,
            GenreRepository genreRepository,
            ActorRepository actorRepository,
            MovieGenreRepository movieGenreRepository,
            ObjectMapper objectMapper
    ) {
        this.geminiChatService = geminiChatService;
        this.fallback = fallback;
        this.genreRepository = genreRepository;
        this.actorRepository = actorRepository;
        this.movieGenreRepository = movieGenreRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public List<RecommendationCandidate> recommend(RecommendationContext context, List<Movie> candidates) {
        List<RecommendationCandidate> prescored = fallback.recommend(context, candidates);
        if (prescored.isEmpty()) {
            return prescored;
        }

        List<RecommendationCandidate> topCandidates = prescored.stream()
                .limit(PRE_FILTER_LIMIT)
                .toList();

        try {
            return enhanceWithGemini(context, topCandidates, prescored);
        } catch (Exception e) {
            log.warn("Gemini enhancement failed, falling back to rule-based results: {}", e.getMessage());
            return prescored;
        }
    }

    // -------------------------------------------------------------------------
    // Gemini enhancement
    // -------------------------------------------------------------------------

    private List<RecommendationCandidate> enhanceWithGemini(
            RecommendationContext context,
            List<RecommendationCandidate> topCandidates,
            List<RecommendationCandidate> allPrescored
    ) {
        String prompt = buildPrompt(context, topCandidates);
        Optional<String> response = geminiChatService.chat(prompt);

        if (response.isEmpty() || response.get().isBlank()) {
            log.debug("Gemini returned empty response, using rule-based results");
            return allPrescored;
        }

        return mergeGeminiRanking(response.get(), topCandidates, allPrescored);
    }

    private String buildPrompt(RecommendationContext context, List<RecommendationCandidate> candidates) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are a movie recommendation AI for a cinema booking platform.\n");
        sb.append("Rank the candidate movies for the user based on their taste profile.\n\n");

        sb.append("## USER TASTE PROFILE\n");
        appendTopScores(sb, "Genres", context.genreScores(), 6,
                id -> genreRepository.findById(id).map(g -> g.getName()).orElse("Unknown"));
        appendTopScores(sb, "Actors", context.actorScores(), 5,
                id -> actorRepository.findById(id).map(a -> a.getName()).orElse("Unknown"));
        if (!context.directorScores().isEmpty()) {
            sb.append("- Favorite directors: ");
            context.directorScores().entrySet().stream()
                    .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                    .limit(4)
                    .forEach(e -> sb.append(e.getKey()).append(", "));
            sb.append("\n");
        }

        sb.append("\n## MOVIE CANDIDATES\n");
        sb.append("Format: [id=N] Title | Genres | Director | Description\n");
        for (RecommendationCandidate candidate : candidates) {
            Movie movie = candidate.getMovie();
            String genres = movieGenreRepository.findByMovie(movie).stream()
                    .map(mg -> mg.getGenre().getName())
                    .collect(Collectors.joining(", "));
            String director = movie.getDirector() != null ? movie.getDirector() : "Unknown";
            String desc = "";
            if (movie.getDescription() != null && !movie.getDescription().isBlank()) {
                desc = movie.getDescription().length() > 120
                        ? movie.getDescription().substring(0, 120) + "..."
                        : movie.getDescription();
            }
            sb.append(String.format("[id=%d] %s | %s | %s | %s%n",
                    movie.getId(), movie.getTitle(), genres, director, desc));
        }

        sb.append("\n## TASK\n");
        sb.append("Return ONLY a JSON array (no markdown fences, no extra text). ");
        sb.append("Rank movies best-match-first. Max 15 items. Use only IDs from candidates.\n");
        sb.append("Format:\n");
        sb.append("[{\"id\":123,\"reason\":\"Brief reason (max 15 words)\"},...]");

        return sb.toString();
    }

    private <K> void appendTopScores(
            StringBuilder sb,
            String label,
            Map<K, Double> scores,
            int limit,
            Function<K, String> nameResolver
    ) {
        if (scores.isEmpty()) return;
        sb.append("- Top ").append(label).append(": ");
        scores.entrySet().stream()
                .sorted(Map.Entry.<K, Double>comparingByValue().reversed())
                .limit(limit)
                .forEach(e -> sb.append(nameResolver.apply(e.getKey()))
                        .append(" (").append(String.format("%.1f", e.getValue())).append("), "));
        sb.append("\n");
    }

    // -------------------------------------------------------------------------
    // Response parsing & merging
    // -------------------------------------------------------------------------

    private List<RecommendationCandidate> mergeGeminiRanking(
            String geminiResponse,
            List<RecommendationCandidate> topCandidates,
            List<RecommendationCandidate> allPrescored
    ) {
        try {
            String json = extractJsonArray(geminiResponse);
            List<Map<String, Object>> ranked = objectMapper.readValue(json,
                    new TypeReference<List<Map<String, Object>>>() {});

            Map<Long, RecommendationCandidate> byId = topCandidates.stream()
                    .collect(Collectors.toMap(c -> c.getMovie().getId(), c -> c));

            List<RecommendationCandidate> result = new ArrayList<>();
            double rankBonus = GEMINI_RANK_BONUS;

            for (Map<String, Object> item : ranked) {
                Object rawId = item.get("id");
                if (rawId == null) continue;

                Long movieId = ((Number) rawId).longValue();
                String reason = (String) item.getOrDefault("reason", "Recommended by AI");

                RecommendationCandidate candidate = byId.get(movieId);
                if (candidate != null) {
                    candidate.addScore(rankBonus, "AI: " + reason);
                    result.add(candidate);
                    rankBonus -= 1.0;
                }
            }

            allPrescored.stream()
                    .filter(c -> result.stream()
                            .noneMatch(r -> r.getMovie().getId().equals(c.getMovie().getId())))
                    .forEach(result::add);

            result.sort(Comparator.comparing(RecommendationCandidate::getScore).reversed());
            return result;

        } catch (Exception e) {
            log.warn("Failed to parse Gemini recommendation response: {}. Raw: {}",
                    e.getMessage(), geminiResponse.length() > 200 ? geminiResponse.substring(0, 200) + "..." : geminiResponse);
            return allPrescored;
        }
    }

    /**
     * Strip markdown code fences if present, then extract the first JSON array `[...]`.
     */
    private String extractJsonArray(String raw) {
        String text = raw.strip();

        if (text.startsWith("```")) {
            int newline = text.indexOf('\n');
            int closing = text.lastIndexOf("```");
            if (newline > 0 && closing > newline) {
                text = text.substring(newline + 1, closing).strip();
            }
        }

        int start = text.indexOf('[');
        int end = text.lastIndexOf(']');
        if (start >= 0 && end > start) {
            return text.substring(start, end + 1);
        }
        return text;
    }
}
