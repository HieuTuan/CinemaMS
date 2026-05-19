package com.sba301.cinemaai.entity;

import com.sba301.cinemaai.enums.EmotionType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
        name = "ai_emotion_segments",
        indexes = @Index(name = "idx_ai_emotion_segments_analysis", columnList = "analysis_id")
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AIEmotionSegment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "analysis_id", nullable = false)
    private AIAnalysis analysis;

    @Column(name = "start_minute", nullable = false)
    private int startMinute;

    @Column(name = "end_minute", nullable = false)
    private int endMinute;

    @Enumerated(EnumType.STRING)
    @Column(name = "emotion_type", nullable = false, length = 30)
    private EmotionType emotionType;

    @Column(nullable = false)
    private int intensity;

    @Column(length = 500)
    private String description;

    public AIEmotionSegment(
            AIAnalysis analysis,
            int startMinute,
            int endMinute,
            EmotionType emotionType,
            int intensity,
            String description
    ) {
        this.analysis = analysis;
        this.startMinute = startMinute;
        this.endMinute = endMinute;
        this.emotionType = emotionType;
        this.intensity = intensity;
        this.description = description;
    }
}
