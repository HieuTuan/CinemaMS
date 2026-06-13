package com.sba301.cinemaai.controller;

import com.sba301.cinemaai.dto.request.review.CreateReviewRequest;
import com.sba301.cinemaai.dto.request.review.UpdateReviewRequest;
import com.sba301.cinemaai.dto.response.ApiResponse;
import com.sba301.cinemaai.dto.response.PageResponse;
import com.sba301.cinemaai.dto.response.review.MovieRatingAggregationResponse;
import com.sba301.cinemaai.dto.response.review.ReviewResponse;
import com.sba301.cinemaai.security.AuthenticatedUser;
import com.sba301.cinemaai.service.MovieRatingAggregationService;
import com.sba301.cinemaai.service.RecommendationService;
import com.sba301.cinemaai.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Movie review management for customers")
public class ReviewController {

    private final ReviewService reviewService;
    private final MovieRatingAggregationService ratingAggregationService;
    private final RecommendationService recommendationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Create a review", description = "Submit a rating and comment for a movie (requires a USED booking)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Review created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Booking not USED or review already exists"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Movie or booking not found")
    })
    public ApiResponse<ReviewResponse> createReview(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @Valid @RequestBody CreateReviewRequest request
    ) {
        ReviewResponse response = reviewService.createReview(currentUser.email(), request);
        recommendationService.refreshProfile(currentUser.email());
        return ApiResponse.success(response, "Review created successfully");
    }

    @GetMapping("/{reviewId}")
    @Operation(summary = "Get review by ID", description = "Returns a single review by its ID (public)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Review returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Review not found")
    })
    public ApiResponse<ReviewResponse> getReview(@PathVariable Long reviewId) {
        return ApiResponse.success(reviewService.getById(reviewId));
    }

    @PutMapping("/{reviewId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Update your review", description = "Update rating and comment (only the review owner can update)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Review updated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Not the owner of this review"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Review not found")
    })
    public ApiResponse<ReviewResponse> updateReview(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable Long reviewId,
            @Valid @RequestBody UpdateReviewRequest request
    ) {
        ReviewResponse response = reviewService.updateReview(currentUser.email(), reviewId, request);
        recommendationService.refreshProfile(currentUser.email());
        return ApiResponse.success(response, "Review updated successfully");
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Delete your review", description = "Soft-delete a review — status changes to DELETED, data is preserved")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Review deleted"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Not the owner of this review"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Review not found")
    })
    public ApiResponse<Void> deleteReview(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable Long reviewId
    ) {
        reviewService.deleteReview(currentUser.email(), reviewId);
        return ApiResponse.success(null, "Review deleted successfully");
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get my reviews", description = "Returns all reviews of the current user (excludes DELETED)")
    public ApiResponse<PageResponse<ReviewResponse>> getMyReviews(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.success(reviewService.getMyReviews(currentUser.email(), page, size));
    }

    @GetMapping("/movies/{movieId}")
    @Operation(summary = "Get movie reviews (public)", description = "Returns all VISIBLE reviews for a movie, sorted by newest first")
    public ApiResponse<PageResponse<ReviewResponse>> getMovieReviews(
            @PathVariable Long movieId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.success(reviewService.getMovieReviews(movieId, page, size));
    }

    @GetMapping("/movies/{movieId}/rating")
    @Operation(summary = "Get movie rating aggregation (public)", description = "Returns average rating, star distribution and 5 most recent reviews")
    public ApiResponse<MovieRatingAggregationResponse> getMovieRating(@PathVariable Long movieId) {
        return ApiResponse.success(ratingAggregationService.getMovieRatingAggregation(movieId));
    }

    @GetMapping("/users/{userId}/movies/{movieId}")
    @Operation(summary = "Get a user's review for a movie (public)", description = "Returns the VISIBLE review of a specific user for a specific movie")
    public ApiResponse<ReviewResponse> getUserMovieReview(
            @PathVariable Long userId,
            @PathVariable Long movieId
    ) {
        return reviewService.getUserMovieReviewByUserId(userId, movieId)
                .map(ApiResponse::success)
                .orElseGet(() -> ApiResponse.failure("No review found for this user/movie"));
    }

    @PostMapping("/{reviewId}/ai-update-preferences")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Trigger AI preference update", description = "Manually refresh the preference profile based on all reviews and interactions")
    public ApiResponse<String> triggerAiPreferenceUpdate(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @PathVariable Long reviewId
    ) {
        reviewService.findReviewById(reviewId);
        recommendationService.refreshProfile(currentUser.email());
        return ApiResponse.success("Preference profile refreshed for review " + reviewId);
    }
}
