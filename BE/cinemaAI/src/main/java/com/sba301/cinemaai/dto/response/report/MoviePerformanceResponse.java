package com.sba301.cinemaai.dto.response.report;

import java.math.BigDecimal;
import java.util.List;

public record MoviePerformanceResponse(
        List<MoviePerformanceItem> movies
) {

    public record MoviePerformanceItem(
            Long movieId,
            String movieTitle,
            String posterUrl,
            long totalBookings,
            BigDecimal totalRevenue,
            double avgReviewRating,
            long reviewCount,
            long showtimeCount,
            double avgOccupancyRate
    ) {}
}
