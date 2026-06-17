package com.sba301.cinemaai.dto.response.report;

import java.math.BigDecimal;
import java.util.List;

public record RevenueReportResponse(
        BigDecimal totalRevenue,
        long totalBookings,
        List<RevenuePeriodItem> periods
) {

    public record RevenuePeriodItem(
            String period,
            BigDecimal revenue,
            long bookingCount
    ) {}
}
