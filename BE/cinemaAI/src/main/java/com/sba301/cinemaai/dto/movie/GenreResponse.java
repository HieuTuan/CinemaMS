package com.sba301.cinemaai.dto.movie;

import java.time.LocalDateTime;

public record GenreResponse(
        Long id,
        String name,
        String description,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
