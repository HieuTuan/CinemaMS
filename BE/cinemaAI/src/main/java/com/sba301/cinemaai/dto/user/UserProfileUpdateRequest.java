package com.sba301.cinemaai.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UserProfileUpdateRequest(
        @NotBlank(message = "Full name is required")
        String fullName,

        @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Phone is invalid")
        String phone
) {
}
