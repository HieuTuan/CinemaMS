package com.sba301.cinemaai.dto.user;

import jakarta.validation.constraints.NotBlank;

public record UserProfileUpdateRequest(
        @NotBlank(message = "Full name is required")
        String fullName,
        String phone
) {
}
