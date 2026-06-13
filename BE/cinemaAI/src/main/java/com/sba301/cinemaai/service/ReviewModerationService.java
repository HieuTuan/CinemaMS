package com.sba301.cinemaai.service;

import com.sba301.cinemaai.dto.response.PageResponse;
import com.sba301.cinemaai.dto.response.review.ReviewResponse;
import com.sba301.cinemaai.entity.Review;
import com.sba301.cinemaai.enums.ReviewStatus;
import com.sba301.cinemaai.exception.BadRequestException;
import com.sba301.cinemaai.exception.NotFoundException;
import com.sba301.cinemaai.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewModerationService {

    private final ReviewRepository reviewRepository;

    @Transactional
    public ReviewResponse hideReview(Long reviewId, String reason) {
        Review review = findReview(reviewId);
        if (review.getStatus() == ReviewStatus.DELETED) {
            throw new BadRequestException("Cannot hide a deleted review");
        }
        if (review.getStatus() == ReviewStatus.HIDDEN) {
            return ReviewResponse.from(review);
        }
        review.changeStatus(ReviewStatus.HIDDEN);
        Review saved = reviewRepository.save(review);

        log.info("Review hidden by admin: reviewId={}, reason={}", reviewId, reason);
        return ReviewResponse.from(saved);
    }

    @Transactional
    public ReviewResponse unhideReview(Long reviewId) {
        Review review = findReview(reviewId);
        if (review.getStatus() != ReviewStatus.HIDDEN) {
            throw new BadRequestException(
                    "Only HIDDEN reviews can be unhidden. Current status: " + review.getStatus());
        }
        review.changeStatus(ReviewStatus.VISIBLE);
        Review saved = reviewRepository.save(review);

        log.info("Review unhidden by admin: reviewId={}", reviewId);
        return ReviewResponse.from(saved);
    }

    @Transactional
    public void softDeleteReview(Long reviewId) {
        Review review = findReview(reviewId);
        if (review.getStatus() == ReviewStatus.DELETED) {
            return;
        }
        review.changeStatus(ReviewStatus.DELETED);
        reviewRepository.save(review);

        log.info("Review soft-deleted by admin: reviewId={}", reviewId);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getHiddenReviews(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(
                reviewRepository.findByStatus(ReviewStatus.HIDDEN, pageable)
                        .map(ReviewResponse::from));
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getDeletedReviews(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(
                reviewRepository.findByStatus(ReviewStatus.DELETED, pageable)
                        .map(ReviewResponse::from));
    }

    private Review findReview(Long reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NotFoundException("Review not found: " + reviewId));
    }
}
