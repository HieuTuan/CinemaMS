package com.sba301.cinemaai.controller;

import com.sba301.cinemaai.dto.request.review.HideReviewRequest;
import com.sba301.cinemaai.dto.response.ApiResponse;
import com.sba301.cinemaai.dto.response.PageResponse;
import com.sba301.cinemaai.dto.response.review.ReviewResponse;
import com.sba301.cinemaai.service.ReviewModerationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Admin - Reviews", description = "Admin review moderation endpoints")
public class AdminReviewController {

    private final ReviewModerationService reviewModerationService;

    @PostMapping("/{reviewId}/hide")
    @Operation(summary = "Hide a review", description = "Change review status from VISIBLE to HIDDEN so it no longer shows publicly")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Review hidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Cannot hide a deleted review"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Review not found")
    })
    public ApiResponse<ReviewResponse> hideReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody(required = false) HideReviewRequest request
    ) {
        String reason = request != null ? request.getReason() : null;
        return ApiResponse.success(
                reviewModerationService.hideReview(reviewId, reason),
                "Review hidden successfully");
    }

    @PostMapping("/{reviewId}/unhide")
    @Operation(summary = "Unhide a review", description = "Restore a HIDDEN review back to VISIBLE")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Review restored to visible"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Review is not HIDDEN"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Review not found")
    })
    public ApiResponse<ReviewResponse> unhideReview(@PathVariable Long reviewId) {
        return ApiResponse.success(
                reviewModerationService.unhideReview(reviewId),
                "Review restored to visible");
    }

    @DeleteMapping("/{reviewId}")
    @Operation(summary = "Soft-delete a review (admin)", description = "Force-delete any review — status changes to DELETED, data is preserved")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Review deleted"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Review not found")
    })
    public ApiResponse<Void> softDeleteReview(@PathVariable Long reviewId) {
        reviewModerationService.softDeleteReview(reviewId);
        return ApiResponse.success(null, "Review deleted successfully");
    }

    @GetMapping("/hidden")
    @Operation(summary = "List hidden reviews", description = "Returns all HIDDEN reviews for the moderation dashboard")
    public ApiResponse<PageResponse<ReviewResponse>> getHiddenReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.success(reviewModerationService.getHiddenReviews(page, size));
    }

    @GetMapping("/deleted")
    @Operation(summary = "List deleted reviews", description = "Returns all soft-deleted reviews")
    public ApiResponse<PageResponse<ReviewResponse>> getDeletedReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.success(reviewModerationService.getDeletedReviews(page, size));
    }
}
