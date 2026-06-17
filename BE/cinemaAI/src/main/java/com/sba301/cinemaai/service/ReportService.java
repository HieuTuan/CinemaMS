package com.sba301.cinemaai.service;

import com.sba301.cinemaai.dto.response.report.DashboardSummaryResponse;
import com.sba301.cinemaai.dto.response.report.MoviePerformanceResponse;
import com.sba301.cinemaai.dto.response.report.MoviePerformanceResponse.MoviePerformanceItem;
import com.sba301.cinemaai.dto.response.report.OccupancyReportResponse;
import com.sba301.cinemaai.dto.response.report.OccupancyReportResponse.ShowtimeOccupancyItem;
import com.sba301.cinemaai.dto.response.report.RecommendationEffectivenessResponse;
import com.sba301.cinemaai.dto.response.report.RecommendationEffectivenessResponse.MovieEffectivenessItem;
import com.sba301.cinemaai.dto.response.report.RevenueReportResponse;
import com.sba301.cinemaai.dto.response.report.RevenueReportResponse.RevenuePeriodItem;
import com.sba301.cinemaai.entity.AIAnalysis;
import com.sba301.cinemaai.entity.Booking;
import com.sba301.cinemaai.entity.BookingSeat;
import com.sba301.cinemaai.entity.Movie;
import com.sba301.cinemaai.entity.Review;
import com.sba301.cinemaai.entity.Showtime;
import com.sba301.cinemaai.enums.AIAnalysisStatus;
import com.sba301.cinemaai.enums.BookingStatus;
import com.sba301.cinemaai.enums.MovieStatus;
import com.sba301.cinemaai.enums.ReviewStatus;
import com.sba301.cinemaai.enums.SeatRuntimeStatus;
import com.sba301.cinemaai.repository.AIAnalysisRepository;
import com.sba301.cinemaai.repository.BookingRepository;
import com.sba301.cinemaai.repository.BookingSeatRepository;
import com.sba301.cinemaai.repository.MovieRepository;
import com.sba301.cinemaai.repository.ReviewRepository;
import com.sba301.cinemaai.repository.ShowtimeRepository;
import com.sba301.cinemaai.repository.StaffProfileRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final ReviewRepository reviewRepository;
    private final AIAnalysisRepository aiAnalysisRepository;
    private final StaffProfileRepository staffProfileRepository;

    // ---- Dashboard ----

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboard(Long cinemaId, LocalDate from, LocalDate to) {
        LocalDateTime fromDt = from != null ? from.atStartOfDay() : LocalDate.now().minusMonths(1).atStartOfDay();
        LocalDateTime toDt   = to   != null ? to.plusDays(1).atStartOfDay() : LocalDate.now().plusDays(1).atStartOfDay();

        BigDecimal totalRevenue = bookingRepository.sumRevenueBetween(cinemaId, fromDt, toDt);
        long totalBookings      = bookingRepository.countPaidBetween(cinemaId, fromDt, toDt);
        long totalStaff         = staffProfileRepository.count();
        long activeMovies       = movieRepository.findByStatus(MovieStatus.NOW_SHOWING).size();

        List<Showtime> showtimes = cinemaId != null
                ? showtimeRepository.findByStartTimeBetween(fromDt, toDt)
                        .stream().filter(s -> s.getRoom().getCinema().getId().equals(cinemaId)).toList()
                : showtimeRepository.findByStartTimeBetween(fromDt, toDt);

        long[] occupancy = computeOccupancy(showtimes);
        double occupancyRate = occupancy[0] == 0 ? 0.0
                : round((double) occupancy[1] / occupancy[0] * 100, 2);

        return new DashboardSummaryResponse(
                totalRevenue,
                totalBookings,
                totalStaff,
                occupancyRate,
                showtimes.size(),
                activeMovies,
                0L
        );
    }

    // ---- Revenue Report ----

    @Transactional(readOnly = true)
    public RevenueReportResponse getRevenueReport(Long cinemaId, LocalDate from, LocalDate to, String groupBy) {
        LocalDateTime fromDt = from != null ? from.atStartOfDay() : LocalDate.now().minusMonths(1).atStartOfDay();
        LocalDateTime toDt   = to   != null ? to.plusDays(1).atStartOfDay() : LocalDate.now().plusDays(1).atStartOfDay();

        List<Booking> bookings = bookingRepository.findPaidBetween(cinemaId, fromDt, toDt);

        BigDecimal totalRevenue = bookings.stream()
                .map(Booking::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        DateTimeFormatter formatter = resolveFormatter(groupBy);

        Map<String, List<Booking>> grouped = bookings.stream()
                .collect(Collectors.groupingBy(b -> formatter.format(b.getPaidAt())));

        List<RevenuePeriodItem> periods = grouped.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new RevenuePeriodItem(
                        e.getKey(),
                        e.getValue().stream().map(Booking::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add),
                        e.getValue().size()
                ))
                .toList();

        return new RevenueReportResponse(totalRevenue, bookings.size(), periods);
    }

    // ---- Occupancy Report ----

    @Transactional(readOnly = true)
    public OccupancyReportResponse getOccupancyReport(Long cinemaId, LocalDate from, LocalDate to) {
        LocalDateTime fromDt = from != null ? from.atStartOfDay() : LocalDate.now().minusMonths(1).atStartOfDay();
        LocalDateTime toDt   = to   != null ? to.plusDays(1).atStartOfDay() : LocalDate.now().plusDays(1).atStartOfDay();

        List<Showtime> showtimes = showtimeRepository.findByStartTimeBetween(fromDt, toDt)
                .stream()
                .filter(s -> cinemaId == null || s.getRoom().getCinema().getId().equals(cinemaId))
                .toList();

        List<ShowtimeOccupancyItem> items = showtimes.stream()
                .map(this::toOccupancyItem)
                .sorted(Comparator.comparing(ShowtimeOccupancyItem::startTime))
                .toList();

        long totalSeats    = items.stream().mapToLong(ShowtimeOccupancyItem::totalSeats).sum();
        long occupiedSeats = items.stream().mapToLong(ShowtimeOccupancyItem::occupiedSeats).sum();
        double overall     = totalSeats == 0 ? 0.0 : round((double) occupiedSeats / totalSeats * 100, 2);

        return new OccupancyReportResponse(overall, totalSeats, occupiedSeats, items);
    }

    // ---- Movie Performance Report ----

    @Transactional(readOnly = true)
    public MoviePerformanceResponse getMoviePerformanceReport(LocalDate from, LocalDate to) {
        LocalDateTime fromDt = from != null ? from.atStartOfDay() : LocalDate.now().minusMonths(1).atStartOfDay();
        LocalDateTime toDt   = to   != null ? to.plusDays(1).atStartOfDay() : LocalDate.now().plusDays(1).atStartOfDay();

        List<Booking> bookings = bookingRepository.findPaidBetween(null, fromDt, toDt);

        Map<Movie, List<Booking>> byMovie = bookings.stream()
                .collect(Collectors.groupingBy(b -> b.getShowtime().getMovie()));

        List<MoviePerformanceItem> items = byMovie.entrySet().stream()
                .map(e -> buildMovieItem(e.getKey(), e.getValue(), fromDt, toDt))
                .sorted(Comparator.comparing(MoviePerformanceItem::totalRevenue).reversed())
                .toList();

        return new MoviePerformanceResponse(items);
    }

    // ---- Recommendation Effectiveness Report ----

    @Transactional(readOnly = true)
    public RecommendationEffectivenessResponse getRecommendationEffectiveness() {
        List<Movie> movies = movieRepository.findAll();

        List<MovieEffectivenessItem> items = movies.stream()
                .map(this::buildEffectivenessItem)
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingDouble(MovieEffectivenessItem::delta))
                .toList();

        double avgDelta = items.isEmpty() ? 0.0
                : round(items.stream().mapToDouble(MovieEffectivenessItem::delta).average().orElse(0.0), 3);

        return new RecommendationEffectivenessResponse(avgDelta, items.size(), items);
    }

    // ---- Private helpers ----

    private ShowtimeOccupancyItem toOccupancyItem(Showtime showtime) {
        int totalSeats = showtime.getRoom().getRowCount() * showtime.getRoom().getColumnCount();
        long occupied  = bookingSeatRepository.findByShowtime(showtime)
                .stream()
                .filter(bs -> bs.getStatus() == SeatRuntimeStatus.BOOKED
                           || bs.getStatus() == SeatRuntimeStatus.CHECKED_IN)
                .count();
        double rate = totalSeats == 0 ? 0.0 : round((double) occupied / totalSeats * 100, 2);

        return new ShowtimeOccupancyItem(
                showtime.getId(),
                showtime.getMovie().getTitle(),
                showtime.getRoom().getName(),
                showtime.getStartTime(),
                totalSeats,
                (int) occupied,
                rate
        );
    }

    private long[] computeOccupancy(List<Showtime> showtimes) {
        long total    = 0;
        long occupied = 0;
        for (Showtime s : showtimes) {
            int cap = s.getRoom().getRowCount() * s.getRoom().getColumnCount();
            long occ = bookingSeatRepository.findByShowtime(s)
                    .stream()
                    .filter(bs -> bs.getStatus() == SeatRuntimeStatus.BOOKED
                               || bs.getStatus() == SeatRuntimeStatus.CHECKED_IN)
                    .count();
            total    += cap;
            occupied += occ;
        }
        return new long[]{total, occupied};
    }

    private MoviePerformanceItem buildMovieItem(Movie movie, List<Booking> bookings,
                                                LocalDateTime fromDt, LocalDateTime toDt) {
        BigDecimal revenue = bookings.stream()
                .map(Booking::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Review> reviews = reviewRepository.findByMovieAndStatus(movie, ReviewStatus.VISIBLE);
        double avgRating = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);

        List<Showtime> showtimes = showtimeRepository.findByMovie(movie)
                .stream()
                .filter(s -> !s.getStartTime().isBefore(fromDt) && s.getStartTime().isBefore(toDt))
                .toList();

        long[] occupancy = computeOccupancy(showtimes);
        double avgOcc = occupancy[0] == 0 ? 0.0 : round((double) occupancy[1] / occupancy[0] * 100, 2);

        return new MoviePerformanceItem(
                movie.getId(),
                movie.getTitle(),
                movie.getPosterUrl(),
                bookings.size(),
                revenue,
                round(avgRating, 2),
                reviews.size(),
                showtimes.size(),
                avgOcc
        );
    }

    private MovieEffectivenessItem buildEffectivenessItem(Movie movie) {
        var analysisOpt = aiAnalysisRepository.findFirstByMovieAndStatusOrderByApprovedAtDesc(
                movie, AIAnalysisStatus.APPROVED);
        if (analysisOpt.isEmpty() || analysisOpt.get().getOverallScore() == null) return null;

        AIAnalysis analysis = analysisOpt.get();
        List<Review> reviews = reviewRepository.findByMovieAndStatus(movie, ReviewStatus.VISIBLE);
        if (reviews.isEmpty()) return null;

        double avgReviewRating  = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        double normalizedAiScore = analysis.getOverallScore().doubleValue() / 2.0;
        double delta = round(avgReviewRating - normalizedAiScore, 3);

        return new MovieEffectivenessItem(
                movie.getId(),
                movie.getTitle(),
                analysis.getOverallScore(),
                round(normalizedAiScore, 3),
                round(avgReviewRating, 3),
                reviews.size(),
                delta
        );
    }

    private DateTimeFormatter resolveFormatter(String groupBy) {
        return switch (groupBy != null ? groupBy.toLowerCase() : "day") {
            case "month" -> DateTimeFormatter.ofPattern("yyyy-MM");
            case "week"  -> DateTimeFormatter.ofPattern("yyyy-ww");
            default      -> DateTimeFormatter.ofPattern("yyyy-MM-dd");
        };
    }

    private double round(double value, int scale) {
        return BigDecimal.valueOf(value).setScale(scale, RoundingMode.HALF_UP).doubleValue();
    }
}
