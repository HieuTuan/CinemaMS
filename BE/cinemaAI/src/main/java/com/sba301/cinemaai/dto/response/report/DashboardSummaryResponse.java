package com.sba301.cinemaai.dto.response.report;

import java.math.BigDecimal;

public record DashboardSummaryResponse(
        BigDecimal totalRevenue,
        long totalBookings,
        long totalStaff,
        double occupancyRate,
        long totalShowtimes,
        long activeMovies,
        long pendingAuditLogs
) {}
