package com.sba301.cinemaai.dto.cinema;

import com.sba301.cinemaai.enums.SeatStatus;
import com.sba301.cinemaai.enums.SeatType;

public record ShowtimeSeatResponse(
        Long seatId,
        String rowLabel,
        int seatNumber,
        SeatType seatType,
        SeatStatus seatStatus,
        String runtimeStatus
) {
}
