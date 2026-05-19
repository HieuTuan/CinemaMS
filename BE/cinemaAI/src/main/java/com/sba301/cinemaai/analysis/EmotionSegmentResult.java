package com.sba301.cinemaai.analysis;

import com.sba301.cinemaai.enums.EmotionType;

public record EmotionSegmentResult(
        int startMinute,
        int endMinute,
        EmotionType emotionType,
        int intensity,
        String description
) {
}
