package com.sba301.cinemaai.dto.response.review;

import java.util.List;
import java.util.Map;

public record MovieRatingAggregationResponse(
        Long movieId,
        String title,
        Double averageRating,
        Long totalReviews,
        Map<Integer, Long> ratingDistribution,
        List<ReviewResponse> recentReviews
) {}
