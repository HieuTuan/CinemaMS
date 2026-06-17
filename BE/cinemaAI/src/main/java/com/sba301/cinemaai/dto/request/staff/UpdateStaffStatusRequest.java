package com.sba301.cinemaai.dto.request.staff;

import com.sba301.cinemaai.enums.StaffStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateStaffStatusRequest(

        @NotNull(message = "Status is required")
        StaffStatus status
) {}
