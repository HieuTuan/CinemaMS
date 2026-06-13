package com.sba301.cinemaai.service;

import com.sba301.cinemaai.dto.response.review.MovieRatingAggregationResponse;
import com.sba301.cinemaai.dto.response.review.ReviewResponse;
import com.sba301.cinemaai.entity.Movie;
import com.sba301.cinemaai.entity.Review;
import com.sba301.cinemaai.enums.ReviewStatus;
import com.sba301.cinemaai.exception.NotFoundException;
import com.sba301.cinemaai.repository.MovieRepository;
import com.sba301.cinemaai.repository.ReviewRepository;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MovieRatingAggregationService {

    private static final int RECENT_REVIEWS_LIMIT = 5;

    private final ReviewRepository reviewRepository;
    private final MovieRepository movieRepository;

    @Transactional(readOnly = true)
    public MovieRatingAggregationResponse getMovieRatingAggregation(Long movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new NotFoundException("Movie not found: " + movieId));

        List<Review> visibleReviews = reviewRepository.findByMovieAndStatus(movie, ReviewStatus.VISIBLE);

        double averageRating = calculateAverageRating(visibleReviews);
        Map<Integer, Long> distribution = getRatingDistribution(visibleReviews);
        List<ReviewResponse> recentReviews = getRecentReviews(visibleReviews);

        return new MovieRatingAggregationResponse(
                movie.getId(),
                movie.getTitle(),
                averageRating,
                (long) visibleReviews.size(),
                distribution,
                recentReviews
        );
    }

    // ================================================================
    // Private helpers
    // ================================================================

    private double calculateAverageRating(List<Review> reviews) {
        if (reviews.isEmpty()) {
            return 0.0;
        }
        double sum = reviews.stream().mapToInt(Review::getRating).sum();
        double avg = sum / reviews.size();
        return Math.round(avg * 10.0) / 10.0;
    }

    private Map<Integer, Long> getRatingDistribution(List<Review> reviews) {
        Map<Integer, Long> distribution = new LinkedHashMap<>();
        for (int star = 1; star <= 5; star++) {
            distribution.put(star, 0L);
        }
        reviews.stream()
                .collect(Collectors.groupingBy(Review::getRating, Collectors.counting()))
                .forEach(distribution::put);
        return distribution;
    }

    private List<ReviewResponse> getRecentReviews(List<Review> visibleReviews) {
        return visibleReviews.stream()
                .sorted(Comparator.comparing(
                        review -> review.getCreatedAt() != null ? review.getCreatedAt() : LocalDateTime.MIN,
                        Comparator.reverseOrder()))
                .limit(RECENT_REVIEWS_LIMIT)
                .map(ReviewResponse::from)
                .toList();
    }
}
