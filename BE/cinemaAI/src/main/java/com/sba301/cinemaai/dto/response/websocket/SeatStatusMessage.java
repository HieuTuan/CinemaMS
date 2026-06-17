package com.sba301.cinemaai.dto.response.websocket;

import com.sba301.cinemaai.enums.SeatRuntimeStatus;
import com.sba301.cinemaai.enums.SeatType;

public record SeatStatusMessage(
        Long showtimeId,
        Long seatId,
        String rowLabel,
        int seatNumber,
        SeatType seatType,
        SeatRuntimeStatus status
) {
}
