package com.sba301.cinemaai.dto.booking;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CreateBookingRequest(
        @NotNull(message = "Hold booking id is required")
        Long holdBookingId,

        @Valid
        List<BookingFoodRequest> foods
) {
}
