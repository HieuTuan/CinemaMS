package com.sba301.cinemaai.analysis;

public record MovieAnalysisPrompt(
        Long movieId,
        String title,
        String description,
        int durationMinutes,
        String language,
        String ageRating,
        String director,
        String castList
) {
}
