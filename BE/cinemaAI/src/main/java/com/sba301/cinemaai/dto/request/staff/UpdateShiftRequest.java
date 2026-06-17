package com.sba301.cinemaai.dto.request.staff;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record UpdateShiftRequest(

        @NotNull(message = "Start time is required")
        LocalDateTime startTime,

        @NotNull(message = "End time is required")
        LocalDateTime endTime,

        @Size(max = 500, message = "Note must be at most 500 characters")
        String note
) {}
