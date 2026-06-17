package com.sba301.cinemaai.controller;

import com.sba301.cinemaai.dto.response.ApiResponse;
import com.sba301.cinemaai.dto.response.report.DashboardSummaryResponse;
import com.sba301.cinemaai.dto.response.report.MoviePerformanceResponse;
import com.sba301.cinemaai.dto.response.report.OccupancyReportResponse;
import com.sba301.cinemaai.dto.response.report.RecommendationEffectivenessResponse;
import com.sba301.cinemaai.dto.response.report.RevenueReportResponse;
import com.sba301.cinemaai.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Admin Reports", description = "Operational reports for cinema owner/admin - requires ADMIN role")
public class AdminReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    @Operation(
            summary = "Dashboard summary",
            description = "Overall KPIs: revenue, bookings, staff count, occupancy rate, active movies"
    )
    public ApiResponse<DashboardSummaryResponse> dashboard(
            @RequestParam(required = false) Long cinemaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ApiResponse.success(reportService.getDashboard(cinemaId, from, to));
    }

    @GetMapping("/revenue")
    @Operation(
            summary = "Revenue report",
            description = "Total revenue grouped by day/week/month. groupBy: day | week | month"
    )
    public ApiResponse<RevenueReportResponse> revenue(
            @RequestParam(required = false) Long cinemaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "day") String groupBy
    ) {
        return ApiResponse.success(reportService.getRevenueReport(cinemaId, from, to, groupBy));
    }

    @GetMapping("/occupancy")
    @Operation(
            summary = "Occupancy report",
            description = "Seat occupancy rate per showtime within the given date range"
    )
    public ApiResponse<OccupancyReportResponse> occupancy(
            @RequestParam(required = false) Long cinemaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ApiResponse.success(reportService.getOccupancyReport(cinemaId, from, to));
    }

    @GetMapping("/movie-performance")
    @Operation(
            summary = "Movie performance report",
            description = "Per-movie stats: bookings, revenue, avg rating, showtime count, avg occupancy"
    )
    public ApiResponse<MoviePerformanceResponse> moviePerformance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ApiResponse.success(reportService.getMoviePerformanceReport(from, to));
    }

    @GetMapping("/recommendation-effectiveness")
    @Operation(
            summary = "Recommendation effectiveness report",
            description = "Compares AI overall score (normalized 0-5) with actual user review ratings to measure AI accuracy"
    )
    public ApiResponse<RecommendationEffectivenessResponse> recommendationEffectiveness() {
        return ApiResponse.success(reportService.getRecommendationEffectiveness());
    }
}
