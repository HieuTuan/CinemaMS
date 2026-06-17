package com.sba301.cinemaai.dto.request.staff;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateStaffRequest(

        Long cinemaId,

        @NotBlank(message = "Position is required")
        @Size(max = 100, message = "Position must be at most 100 characters")
        String position
) {}
