package com.sba301.cinemaai.dto.movie;

import com.sba301.cinemaai.enums.MovieStatus;
import jakarta.validation.constraints.NotNull;

public record MovieStatusUpdateRequest(
        @NotNull(message = "Status is required")
        MovieStatus status
) {
}
