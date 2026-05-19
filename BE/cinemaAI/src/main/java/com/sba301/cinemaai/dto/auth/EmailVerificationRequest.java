package com.sba301.cinemaai.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record EmailVerificationRequest(
        @NotBlank(message = "Token is required")
        String token
) {
}
