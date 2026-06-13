package com.sba301.cinemaai.dto.response.review;

import com.sba301.cinemaai.entity.Review;
import com.sba301.cinemaai.enums.ReviewStatus;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReviewResponse {

    private Long id;
    private Long userId;
    private Long movieId;
    private String movieTitle;
    private Long bookingId;
    private int rating;
    private String comment;
    private ReviewStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ReviewResponse from(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .movieId(review.getMovie().getId())
                .movieTitle(review.getMovie().getTitle())
                .bookingId(review.getBooking() != null ? review.getBooking().getId() : null)
                .rating(review.getRating())
                .comment(review.getComment())
                .status(review.getStatus())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
