package com.sba301.cinemaai.service;

import com.sba301.cinemaai.dto.response.recommendation.FavoriteActorRecommendationResponse;
import com.sba301.cinemaai.dto.response.recommendation.MovieRecommendationResponse;
import com.sba301.cinemaai.dto.response.recommendation.RecommendationDebugResponse;
import com.sba301.cinemaai.dto.request.recommendation.TrailerInteractionRequest;
import com.sba301.cinemaai.dto.response.recommendation.TrailerInteractionResponse;
import com.sba301.cinemaai.dto.response.recommendation.UserPreferenceProfileResponse;
import com.sba301.cinemaai.entity.Actor;
import com.sba301.cinemaai.entity.Booking;
import com.sba301.cinemaai.entity.Genre;
import com.sba301.cinemaai.entity.Movie;
import com.sba301.cinemaai.entity.MovieActor;
import com.sba301.cinemaai.entity.MovieGenre;
import com.sba301.cinemaai.entity.Review;
import com.sba301.cinemaai.entity.TrailerInteraction;
import com.sba301.cinemaai.entity.User;
import com.sba301.cinemaai.entity.UserPreferenceProfile;
import com.sba301.cinemaai.entity.Wishlist;
import com.sba301.cinemaai.enums.BookingStatus;
import com.sba301.cinemaai.enums.MovieStatus;
import com.sba301.cinemaai.enums.ReviewStatus;
import com.sba301.cinemaai.enums.TrailerInteractionType;
import com.sba301.cinemaai.exception.BadRequestException;
import com.sba301.cinemaai.exception.NotFoundException;
import com.sba301.cinemaai.recommendation.RecommendationCandidate;
import com.sba301.cinemaai.recommendation.RecommendationContext;
import com.sba301.cinemaai.recommendation.RecommendationStrategy;
import com.sba301.cinemaai.repository.ActorRepository;
import com.sba301.cinemaai.repository.BookingRepository;
import com.sba301.cinemaai.repository.GenreRepository;
import com.sba301.cinemaai.repository.MovieActorRepository;
import com.sba301.cinemaai.repository.MovieGenreRepository;
import com.sba301.cinemaai.repository.MovieRepository;
import com.sba301.cinemaai.repository.ReviewRepository;
import com.sba301.cinemaai.repository.TrailerInteractionRepository;
import com.sba301.cinemaai.repository.UserPreferenceProfileRepository;
import com.sba301.cinemaai.repository.UserRepository;
import com.sba301.cinemaai.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    // ─────────── signal weights ───────────
    private static final double WEIGHT_BOOKING_PAID  = 4.0;
    private static final double WEIGHT_WISHLIST       = 3.0;
    private static final double WEIGHT_TRAILER_COMPLETE = 5.0;
    private static final double WEIGHT_TRAILER_SKIP  = -1.0;
    private static final double WEIGHT_TRAILER_CLICK = 1.0;
    private static final double WEIGHT_TRAILER_DEFAULT = 2.0;

    private final UserRepository userRepository;
    private final MovieRepository movieRepository;
    private final ActorRepository actorRepository;
    private final GenreRepository genreRepository;
    private final MovieGenreRepository movieGenreRepository;
    private final MovieActorRepository movieActorRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final TrailerInteractionRepository trailerInteractionRepository;
    private final WishlistRepository wishlistRepository;
    private final UserPreferenceProfileRepository preferenceProfileRepository;
    private final RecommendationStrategy recommendationStrategy;

    // =========================================================================
    // 16.1  Signal collection — Trailer interactions
    // =========================================================================

    @Transactional
    public TrailerInteractionResponse recordTrailerInteraction(String email, TrailerInteractionRequest request) {
        User user = findUserByEmail(email);
        Movie movie = movieRepository.findById(request.movieId())
                .orElseThrow(() -> new NotFoundException("Movie not found"));
        validateTrailerSeconds(request);

        TrailerInteraction saved = trailerInteractionRepository.save(new TrailerInteraction(
                user,
                movie,
                request.interactionType(),
                request.watchedSeconds(),
                request.totalSeconds()
        ));
        refreshProfile(user);
        return toTrailerInteractionResponse(saved);
    }

    // =========================================================================
    // 16.2  User preference profile
    // =========================================================================

    /**
     * Explicitly refresh the preference profile for the authenticated user.
     */
    @Transactional
    public UserPreferenceProfileResponse refreshProfile(String email) {
        return toProfileResponse(refreshProfile(findUserByEmail(email)));
    }

    /**
     * Fire-and-forget async profile refresh (e.g. triggered after a review change).
     * 13.5 – Review impact on recommendation.
     */
    @Async
    public void refreshProfileAsync(String email) {
        try {
            User user = findUserByEmail(email);
            refreshProfile(user);
            log.debug("Async profile refresh completed for user {}", email);
        } catch (Exception e) {
            log.warn("Async profile refresh failed for {}: {}", email, e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public UserPreferenceProfileResponse getProfile(String email) {
        User user = findUserByEmail(email);
        UserPreferenceProfile profile = preferenceProfileRepository.findByUser(user)
                .orElseGet(() -> new UserPreferenceProfile(user));
        return toProfileResponse(profile);
    }

    // =========================================================================
    // 16.3  Personalised movie recommendations
    // =========================================================================

    @Transactional(readOnly = true)
    public List<MovieRecommendationResponse> recommendMovies(String email, int limit) {
        User user = findUserByEmail(email);
        UserPreferenceProfile profile = preferenceProfileRepository.findByUser(user)
                .orElseGet(() -> new UserPreferenceProfile(user));
        RecommendationContext context = buildContext(user, profile);

        List<Movie> candidates = movieRepository.findAll().stream()
                .filter(m -> m.getStatus() == MovieStatus.NOW_SHOWING || m.getStatus() == MovieStatus.UPCOMING)
                .toList();

        return recommendationStrategy.recommend(context, candidates)
                .stream()
                .limit(safeLimit(limit))
                .map(this::toMovieRecommendationResponse)
                .toList();
    }

    // =========================================================================
    // 16.4  Recommendations by favourite actors
    // =========================================================================

    @Transactional(readOnly = true)
    public List<FavoriteActorRecommendationResponse> recommendByFavoriteActors(String email, int limit) {
        User user = findUserByEmail(email);
        UserPreferenceProfile profile = preferenceProfileRepository.findByUser(user)
                .orElseGet(() -> new UserPreferenceProfile(user));
        Map<Long, Double> actorScores = parseLongScoreMap(profile.getActorScores());
        Set<Long> watchedMovieIds = collectWatchedMovieIds(user);

        return actorScores.entrySet().stream()
                .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
                .limit(5)
                .map(entry -> toFavoriteActorRecommendation(entry.getKey(), entry.getValue(), watchedMovieIds, limit))
                .filter(response -> !response.movies().isEmpty())
                .toList();
    }

    // =========================================================================
    // 16.5  Admin debug
    // =========================================================================

    @Transactional(readOnly = true)
    public RecommendationDebugResponse debugUser(Long userId, int limit) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        UserPreferenceProfile profile = preferenceProfileRepository.findByUser(user)
                .orElseGet(() -> new UserPreferenceProfile(user));
        return new RecommendationDebugResponse(
                user.getId(),
                toProfileResponse(profile),
                trailerInteractionRepository.findByUser(user).size(),
                bookingRepository.findByUser(user).size(),
                reviewRepository.findByUser(user).size(),
                recommendMovies(user.getEmail(), limit)
        );
    }

    // =========================================================================
    // Internal — signal aggregation
    // =========================================================================

    private UserPreferenceProfile refreshProfile(User user) {
        ScoreAccumulator scores = new ScoreAccumulator();

        // 16.1 – trailer interactions
        applyTrailerSignals(user, scores);

        // 16.1 – booking history (paid = strong positive signal)
        applyBookingSignals(user, scores);

        // 13.5 – review ratings directly influence preference scores
        applyReviewSignals(user, scores);

        // 16.1 – wishlist items indicate intent to watch
        applyWishlistSignals(user, scores);

        UserPreferenceProfile profile = preferenceProfileRepository.findByUser(user)
                .orElseGet(() -> preferenceProfileRepository.save(new UserPreferenceProfile(user)));

        String cohortKey = assignCohortKey(scores.genreScores);

        profile.refresh(
                serializeLongScores(scores.genreScores),
                serializeLongScores(scores.actorScores),
                serializeStringScores(scores.directorScores),
                cohortKey
        );
        return profile;
    }

    private void applyTrailerSignals(User user, ScoreAccumulator scores) {
        for (TrailerInteraction interaction : trailerInteractionRepository.findByUser(user)) {
            double weight = trailerWeight(interaction);
            addMovieFeatureScores(interaction.getMovie(), weight, scores);
        }
    }

    private void applyBookingSignals(User user, ScoreAccumulator scores) {
        for (Booking booking : bookingRepository.findByUser(user)) {
            if (booking.getStatus() == BookingStatus.PAID || booking.getStatus() == BookingStatus.USED) {
                addMovieFeatureScores(booking.getShowtime().getMovie(), WEIGHT_BOOKING_PAID, scores);
            }
        }
    }

    /**
     * 13.5 – Reviews affect recommendation scores:
     * high ratings (≥4) give a strong positive boost;
     * low ratings give a small negative penalty.
     */
    private void applyReviewSignals(User user, ScoreAccumulator scores) {
        for (Review review : reviewRepository.findByUser(user)) {
            if (review.getStatus() != ReviewStatus.VISIBLE) {
                continue;
            }
            double weight = review.getRating() >= 4
                    ? review.getRating() * 1.5
                    : Math.max(-2.0, review.getRating() - 3.0);
            addMovieFeatureScores(review.getMovie(), weight, scores);
        }
    }

    /**
     * 16.1 – Wishlist signals: movies the user added to their wishlist indicate intent.
     */
    private void applyWishlistSignals(User user, ScoreAccumulator scores) {
        for (Wishlist wishlist : wishlistRepository.findByUser(user)) {
            addMovieFeatureScores(wishlist.getMovie(), WEIGHT_WISHLIST, scores);
        }
    }

    private void addMovieFeatureScores(Movie movie, double weight, ScoreAccumulator scores) {
        if (weight == 0) return;
        for (MovieGenre movieGenre : movieGenreRepository.findByMovie(movie)) {
            Genre genre = movieGenre.getGenre();
            scores.genreScores.merge(genre.getId(), weight, Double::sum);
        }
        for (MovieActor movieActor : movieActorRepository.findByMovie(movie)) {
            Actor actor = movieActor.getActor();
            scores.actorScores.merge(actor.getId(), weight, Double::sum);
        }
        if (movie.getDirector() != null && !movie.getDirector().isBlank()) {
            scores.directorScores.merge(movie.getDirector().toLowerCase(), weight, Double::sum);
        }
    }

    // =========================================================================
    // Cohort key assignment (16.2)
    // =========================================================================

    /**
     * Assigns a human-readable cohort key from the top genre preference.
     * Example: "action-fan", "drama-fan", "general"
     */
    private String assignCohortKey(Map<Long, Double> genreScores) {
        if (genreScores.isEmpty()) return "general";
        return genreScores.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .flatMap(e -> genreRepository.findById(e.getKey()))
                .map(g -> g.getName().toLowerCase().replace(" ", "-") + "-fan")
                .orElse("general");
    }

    // =========================================================================
    // Context & scoring helpers
    // =========================================================================

    private double trailerWeight(TrailerInteraction interaction) {
        TrailerInteractionType type = interaction.getInteractionType();
        if (type == TrailerInteractionType.COMPLETE) return WEIGHT_TRAILER_COMPLETE;
        if (type == TrailerInteractionType.SKIP)     return WEIGHT_TRAILER_SKIP;
        if (type == TrailerInteractionType.CLICK)    return WEIGHT_TRAILER_CLICK;
        if (interaction.getWatchedSeconds() != null && interaction.getTotalSeconds() != null
                && interaction.getTotalSeconds() > 0) {
            double ratio = Math.min(1.0, interaction.getWatchedSeconds() / (double) interaction.getTotalSeconds());
            return 1.0 + ratio * 4.0;
        }
        return WEIGHT_TRAILER_DEFAULT;
    }

    private RecommendationContext buildContext(User user, UserPreferenceProfile profile) {
        return new RecommendationContext(
                user,
                profile,
                parseLongScoreMap(profile.getGenreScores()),
                parseLongScoreMap(profile.getActorScores()),
                parseStringScoreMap(profile.getDirectorScores()),
                collectWatchedMovieIds(user)
        );
    }

    private Set<Long> collectWatchedMovieIds(User user) {
        Set<Long> movieIds = new LinkedHashSet<>();
        trailerInteractionRepository.findByUser(user).forEach(i -> movieIds.add(i.getMovie().getId()));
        bookingRepository.findByUser(user).forEach(b -> movieIds.add(b.getShowtime().getMovie().getId()));
        reviewRepository.findByUser(user).forEach(r -> movieIds.add(r.getMovie().getId()));
        return movieIds;
    }

    // =========================================================================
    // Response mappers
    // =========================================================================

    private FavoriteActorRecommendationResponse toFavoriteActorRecommendation(
            Long actorId,
            double preferenceScore,
            Set<Long> watchedMovieIds,
            int limit
    ) {
        Actor actor = actorRepository.findById(actorId)
                .orElseThrow(() -> new NotFoundException("Actor not found"));
        List<MovieRecommendationResponse> movies = movieActorRepository.findByActor(actor)
                .stream()
                .map(MovieActor::getMovie)
                .filter(m -> !watchedMovieIds.contains(m.getId()))
                .filter(m -> m.getStatus() == MovieStatus.NOW_SHOWING || m.getStatus() == MovieStatus.UPCOMING)
                .sorted(Comparator.comparing(Movie::getReleaseDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(safeLimit(limit))
                .map(m -> new MovieRecommendationResponse(
                        m.getId(),
                        m.getTitle(),
                        m.getAgeRating() == null ? null : m.getAgeRating().getLabel(),
                        m.getDirector(),
                        m.getReleaseDate(),
                        m.getPosterUrl(),
                        preferenceScore,
                        List.of("New movie from favourite actor: " + actor.getName())
                ))
                .toList();
        return new FavoriteActorRecommendationResponse(actor.getId(), actor.getName(), preferenceScore, movies);
    }

    private MovieRecommendationResponse toMovieRecommendationResponse(RecommendationCandidate candidate) {
        Movie movie = candidate.getMovie();
        return new MovieRecommendationResponse(
                movie.getId(),
                movie.getTitle(),
                movie.getAgeRating() == null ? null : movie.getAgeRating().getLabel(),
                movie.getDirector(),
                movie.getReleaseDate(),
                movie.getPosterUrl(),
                Math.round(candidate.getScore() * 100.0) / 100.0,
                candidate.getReasons()
        );
    }

    private UserPreferenceProfileResponse toProfileResponse(UserPreferenceProfile profile) {
        return new UserPreferenceProfileResponse(
                profile.getUser().getId(),
                profile.getCohortKey(),
                parseLongScoreMap(profile.getGenreScores()),
                parseLongScoreMap(profile.getActorScores()),
                parseStringScoreMap(profile.getDirectorScores()),
                profile.getLastRefreshedAt()
        );
    }

    private TrailerInteractionResponse toTrailerInteractionResponse(TrailerInteraction interaction) {
        return new TrailerInteractionResponse(
                interaction.getId(),
                interaction.getMovie().getId(),
                interaction.getMovie().getTitle(),
                interaction.getInteractionType(),
                interaction.getWatchedSeconds(),
                interaction.getTotalSeconds(),
                interaction.getCreatedAt()
        );
    }

    // =========================================================================
    // Validation
    // =========================================================================

    private void validateTrailerSeconds(TrailerInteractionRequest request) {
        if (request.watchedSeconds() != null && request.totalSeconds() != null
                && request.watchedSeconds() > request.totalSeconds()) {
            throw new BadRequestException("Watched seconds cannot exceed total seconds");
        }
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private int safeLimit(int limit) {
        return Math.max(1, Math.min(limit, 50));
    }

    // =========================================================================
    // Score serialisation / deserialisation
    // =========================================================================

    private String serializeLongScores(Map<Long, Double> scores) {
        StringBuilder sb = new StringBuilder();
        scores.forEach((k, v) -> sb.append(k).append("=").append(round(v)).append(";"));
        return sb.toString();
    }

    private String serializeStringScores(Map<String, Double> scores) {
        StringBuilder sb = new StringBuilder();
        scores.forEach((k, v) -> sb.append(k).append("=").append(round(v)).append(";"));
        return sb.toString();
    }

    private Map<Long, Double> parseLongScoreMap(String raw) {
        Map<Long, Double> scores = new LinkedHashMap<>();
        if (raw == null || raw.isBlank()) return scores;
        for (String token : raw.split(";")) {
            String[] parts = token.split("=");
            if (parts.length == 2) {
                try {
                    scores.put(Long.parseLong(parts[0]), Double.parseDouble(parts[1]));
                } catch (NumberFormatException ignored) {
                }
            }
        }
        return scores;
    }

    private Map<String, Double> parseStringScoreMap(String raw) {
        Map<String, Double> scores = new LinkedHashMap<>();
        if (raw == null || raw.isBlank()) return scores;
        for (String token : raw.split(";")) {
            String[] parts = token.split("=");
            if (parts.length == 2) {
                try {
                    scores.put(parts[0], Double.parseDouble(parts[1]));
                } catch (NumberFormatException ignored) {
                }
            }
        }
        return scores;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    // =========================================================================
    // Inner helper
    // =========================================================================

    private static class ScoreAccumulator {
        final Map<Long, Double> genreScores    = new LinkedHashMap<>();
        final Map<Long, Double> actorScores    = new LinkedHashMap<>();
        final Map<String, Double> directorScores = new LinkedHashMap<>();
    }
}
