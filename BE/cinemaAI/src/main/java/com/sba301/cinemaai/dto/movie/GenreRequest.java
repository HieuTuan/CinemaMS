package com.sba301.cinemaai.dto.movie;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GenreRequest(
        @NotBlank(message = "Genre name is required")
        @Size(max = 100, message = "Genre name must be at most 100 characters")
        String name,

        @Size(max = 500, message = "Description must be at most 500 characters")
        String description
) {
}
