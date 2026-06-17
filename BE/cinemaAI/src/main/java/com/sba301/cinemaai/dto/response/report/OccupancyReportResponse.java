package com.sba301.cinemaai.dto.response.report;

import java.util.List;

public record OccupancyReportResponse(
        double overallOccupancyRate,
        long totalSeats,
        long occupiedSeats,
        List<ShowtimeOccupancyItem> showtimes
) {

    public record ShowtimeOccupancyItem(
            Long showtimeId,
            String movieTitle,
            String roomName,
            java.time.LocalDateTime startTime,
            int totalSeats,
            int occupiedSeats,
            double occupancyRate
    ) {}
}
