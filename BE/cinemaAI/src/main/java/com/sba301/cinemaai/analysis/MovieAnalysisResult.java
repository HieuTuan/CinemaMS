package com.sba301.cinemaai.analysis;

import com.sba301.cinemaai.enums.ContentLabel;
import com.sba301.cinemaai.enums.TargetAudience;
import java.math.BigDecimal;
import java.util.List;

public record MovieAnalysisResult(
        BigDecimal overallScore,
        BigDecimal violenceScore,
        BigDecimal romanceScore,
        BigDecimal humorScore,
        ContentLabel contentLabel,
        TargetAudience targetAudience,
        String summary,
        String providerRawResponse,
        List<EmotionSegmentResult> emotionSegments
) {
}
