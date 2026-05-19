package com.sba301.cinemaai.analysis;

import com.sba301.cinemaai.enums.ContentLabel;
import com.sba301.cinemaai.enums.EmotionType;
import com.sba301.cinemaai.enums.TargetAudience;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
public class MockMovieAnalysisStrategy implements MovieAnalysisStrategy {

    @Override
    public MovieAnalysisResult analyze(MovieAnalysisPrompt prompt) {
        String searchable = ((prompt.title() == null ? "" : prompt.title()) + " "
                + (prompt.description() == null ? "" : prompt.description())).toLowerCase();

        ContentLabel label = resolveLabel(searchable);
        TargetAudience audience = resolveAudience(prompt.ageRating(), label);
        int duration = Math.max(prompt.durationMinutes(), 90);

        return new MovieAnalysisResult(
                score(8.1),
                score(label == ContentLabel.ACTION || label == ContentLabel.VIOLENCE ? 6.8 : 2.4),
                score(label == ContentLabel.ROMANCE ? 7.2 : 3.1),
                score(label == ContentLabel.COMEDY ? 7.6 : 4.0),
                label,
                audience,
                "Mock analysis for " + prompt.title() + ": balanced pacing, clear audience fit, and review-ready content labels.",
                "{\"provider\":\"mock\",\"movieId\":" + prompt.movieId() + ",\"label\":\"" + label + "\"}",
                List.of(
                        new EmotionSegmentResult(0, duration / 3, EmotionType.CALM, 4, "Opening establishes tone and characters."),
                        new EmotionSegmentResult(duration / 3, duration * 2 / 3, primaryEmotion(label), 7, "Middle act raises the main emotional tension."),
                        new EmotionSegmentResult(duration * 2 / 3, duration, EmotionType.EXCITEMENT, 8, "Final act resolves the central conflict.")
                )
        );
    }

    @Override
    public String providerName() {
        return "mock";
    }

    private ContentLabel resolveLabel(String text) {
        if (text.contains("horror") || text.contains("ghost") || text.contains("fear")) {
            return ContentLabel.HORROR;
        }
        if (text.contains("romance") || text.contains("love")) {
            return ContentLabel.ROMANCE;
        }
        if (text.contains("comedy") || text.contains("laugh")) {
            return ContentLabel.COMEDY;
        }
        if (text.contains("fight") || text.contains("war") || text.contains("violence")) {
            return ContentLabel.VIOLENCE;
        }
        if (text.contains("action") || text.contains("mission") || text.contains("rescue")) {
            return ContentLabel.ACTION;
        }
        return ContentLabel.FAMILY_FRIENDLY;
    }

    private TargetAudience resolveAudience(String ageRating, ContentLabel label) {
        if (ageRating != null && (ageRating.contains("18") || ageRating.contains("16"))) {
            return TargetAudience.ADULT;
        }
        if (label == ContentLabel.ROMANCE) {
            return TargetAudience.COUPLE;
        }
        if (label == ContentLabel.FAMILY_FRIENDLY || (ageRating != null && ageRating.equalsIgnoreCase("P"))) {
            return TargetAudience.FAMILY;
        }
        return TargetAudience.GENERAL;
    }

    private EmotionType primaryEmotion(ContentLabel label) {
        return switch (label) {
            case HORROR, VIOLENCE, MATURE -> EmotionType.TENSION;
            case ROMANCE -> EmotionType.ROMANCE;
            case COMEDY, FAMILY_FRIENDLY -> EmotionType.JOY;
            case ACTION -> EmotionType.EXCITEMENT;
        };
    }

    private BigDecimal score(double value) {
        return BigDecimal.valueOf(value).setScale(2);
    }
}
