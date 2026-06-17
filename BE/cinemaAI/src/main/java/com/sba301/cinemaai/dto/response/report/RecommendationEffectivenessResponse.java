package com.sba301.cinemaai.dto.response.report;

import java.math.BigDecimal;
import java.util.List;

public record RecommendationEffectivenessResponse(
        double avgDelta,
        long analyzedMovieCount,
        List<MovieEffectivenessItem> movies
) {

    /**
     * delta = avgReviewRating - normalizedAiScore (normalized: aiScore / 2, scale 0-5)
     * Positive delta → AI was pessimistic (real ratings higher than AI predicted)
     * Negative delta → AI was over-optimistic (real ratings lower than AI predicted)
     */
    public record MovieEffectivenessItem(
            Long movieId,
            String movieTitle,
            BigDecimal aiOverallScore,
            double normalizedAiScore,
            double avgReviewRating,
            long reviewCount,
            double delta
    ) {}
}
