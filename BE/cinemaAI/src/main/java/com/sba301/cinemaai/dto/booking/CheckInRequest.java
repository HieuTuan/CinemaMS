package com.sba301.cinemaai.dto.booking;

import jakarta.validation.constraints.NotBlank;

public record CheckInRequest(
        @NotBlank(message = "QR code is required")
        String qrCode
) {
}
