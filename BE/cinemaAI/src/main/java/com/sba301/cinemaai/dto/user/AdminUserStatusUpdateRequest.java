package com.sba301.cinemaai.dto.user;

import com.sba301.cinemaai.enums.UserStatus;
import jakarta.validation.constraints.NotNull;

public record AdminUserStatusUpdateRequest(
        @NotNull(message = "Status is required")
        UserStatus status
) {
}
