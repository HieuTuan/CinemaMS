package com.sba301.cinemaai.service;

import com.sba301.cinemaai.dto.request.review.CreateReviewRequest;
import com.sba301.cinemaai.dto.request.review.UpdateReviewRequest;
import com.sba301.cinemaai.dto.response.PageResponse;
import com.sba301.cinemaai.dto.response.review.ReviewResponse;
import com.sba301.cinemaai.entity.Booking;
import com.sba301.cinemaai.entity.Movie;
import com.sba301.cinemaai.entity.Review;
import com.sba301.cinemaai.entity.User;
import com.sba301.cinemaai.enums.BookingStatus;
import com.sba301.cinemaai.enums.ReviewStatus;
import com.sba301.cinemaai.exception.BadRequestException;
import com.sba301.cinemaai.exception.NotFoundException;
import com.sba301.cinemaai.repository.BookingRepository;
import com.sba301.cinemaai.repository.MovieRepository;
import com.sba301.cinemaai.repository.ReviewRepository;
import com.sba301.cinemaai.repository.UserRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;
    private final BookingRepository bookingRepository;

    /**
     * 13.5 – After a review changes, the user's recommendation profile is refreshed asynchronously
     * so that the new rating immediately influences future movie suggestions.
     * @Lazy avoids a potential circular dependency at startup.
     */
    @Lazy
    private final RecommendationService recommendationService;

    @Transactional
    public ReviewResponse createReview(String email, CreateReviewRequest request) {
        User user = resolveUser(email);
        Movie movie = resolveMovie(request.getMovieId());

        if (reviewRepository.existsByUserAndMovie(user, movie)) {
            throw new BadRequestException("You have already reviewed movie: " + movie.getTitle());
        }

        Booking booking = null;
        if (request.getBookingId() != null) {
            booking = resolveBooking(request.getBookingId());
            validateBookingForReview(booking, user);
        }

        validateRating(request.getRating());

        Review review = new Review(user, movie, booking, request.getRating(), request.getComment());
        Review saved = reviewRepository.save(review);

        log.info("Review created: userId={}, movieId={}, rating={}", user.getId(), movie.getId(), request.getRating());

        // 13.5 – refresh preference profile so the new rating influences recommendations
        recommendationService.refreshProfileAsync(email);

        return ReviewResponse.from(saved);
    }

    @Transactional
    public ReviewResponse updateReview(String email, Long reviewId, UpdateReviewRequest request) {
        User user = resolveUser(email);
        Review review = findReviewById(reviewId);
        validateOwner(review, user);
        validateRating(request.getRating());

        review.update(request.getRating(), request.getComment());
        Review saved = reviewRepository.save(review);

        log.info("Review updated: reviewId={}, userId={}, newRating={}", reviewId, user.getId(), request.getRating());

        // 13.5 – refresh preference profile so the updated rating influences recommendations
        recommendationService.refreshProfileAsync(email);

        return ReviewResponse.from(saved);
    }

    @Transactional
    public void deleteReview(String email, Long reviewId) {
        User user = resolveUser(email);
        Review review = findReviewById(reviewId);
        validateOwner(review, user);

        review.changeStatus(ReviewStatus.DELETED);
        reviewRepository.save(review);

        log.info("Review soft-deleted: reviewId={}, userId={}", reviewId, user.getId());

        // 13.5 – recalculate preference profile after review removal
        recommendationService.refreshProfileAsync(email);
    }

    @Transactional(readOnly = true)
    public ReviewResponse getById(Long reviewId) {
        return ReviewResponse.from(findReviewById(reviewId));
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getMyReviews(String email, int page, int size) {
        User user = resolveUser(email);
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(
                reviewRepository.findByUserAndStatusNot(user, ReviewStatus.DELETED, pageable)
                        .map(ReviewResponse::from));
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getMovieReviews(Long movieId, int page, int size) {
        Movie movie = resolveMovie(movieId);
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(
                reviewRepository.findByMovieAndStatus(movie, ReviewStatus.VISIBLE, pageable)
                        .map(ReviewResponse::from));
    }

    @Transactional(readOnly = true)
    public Optional<ReviewResponse> getUserMovieReview(String email, Long movieId) {
        User user = resolveUser(email);
        Movie movie = resolveMovie(movieId);
        return reviewRepository.findByUserAndMovie(user, movie)
                .filter(r -> r.getStatus() != ReviewStatus.DELETED)
                .map(ReviewResponse::from);
    }

    @Transactional(readOnly = true)
    public Optional<ReviewResponse> getUserMovieReviewByUserId(Long userId, Long movieId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
        Movie movie = resolveMovie(movieId);
        return reviewRepository.findByUserAndMovie(user, movie)
                .filter(r -> r.getStatus() == ReviewStatus.VISIBLE)
                .map(ReviewResponse::from);
    }

    public Review findReviewById(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Review not found: " + id));
    }

    // ================================================================
    // Private helpers
    // ================================================================

    private void validateOwner(Review review, User user) {
        if (!review.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You are not the owner of this review");
        }
    }

    private void validateBookingForReview(Booking booking, User user) {
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Booking does not belong to this user");
        }
        if (booking.getStatus() != BookingStatus.USED) {
            throw new BadRequestException(
                    "Only USED bookings can be reviewed. Current booking status: " + booking.getStatus());
        }
    }

    private void validateRating(int rating) {
        if (rating < 1 || rating > 5) {
            throw new BadRequestException("Rating must be between 1 and 5, got: " + rating);
        }
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found: " + email));
    }

    private Movie resolveMovie(Long movieId) {
        return movieRepository.findById(movieId)
                .orElseThrow(() -> new NotFoundException("Movie not found: " + movieId));
    }

    private Booking resolveBooking(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found: " + bookingId));
    }
}
