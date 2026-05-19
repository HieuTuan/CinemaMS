package com.sba301.cinemaai.entity;

import com.sba301.cinemaai.enums.AIAnalysisStatus;
import com.sba301.cinemaai.enums.ContentLabel;
import com.sba301.cinemaai.enums.TargetAudience;
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
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
        name = "ai_analyses",
        indexes = {
                @Index(name = "idx_ai_analyses_movie", columnList = "movie_id"),
                @Index(name = "idx_ai_analyses_status", columnList = "status")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AIAnalysis extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AIAnalysisStatus status = AIAnalysisStatus.PENDING;

    @Column(name = "overall_score", precision = 5, scale = 2)
    private BigDecimal overallScore;

    @Column(name = "violence_score", precision = 5, scale = 2)
    private BigDecimal violenceScore;

    @Column(name = "romance_score", precision = 5, scale = 2)
    private BigDecimal romanceScore;

    @Column(name = "humor_score", precision = 5, scale = 2)
    private BigDecimal humorScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_label", length = 50)
    private ContentLabel contentLabel;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_audience", length = 50)
    private TargetAudience targetAudience;

    @Lob
    @Column(name = "summary")
    private String summary;

    @Lob
    @Column(name = "provider_raw_response")
    private String providerRawResponse;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_user_id")
    private User approvedBy;

    public AIAnalysis(Movie movie) {
        this.movie = movie;
    }

    public void markProcessing() {
        this.status = AIAnalysisStatus.PROCESSING;
    }

    public void applyResult(
            BigDecimal overallScore,
            BigDecimal violenceScore,
            BigDecimal romanceScore,
            BigDecimal humorScore,
            ContentLabel contentLabel,
            TargetAudience targetAudience,
            String summary,
            String providerRawResponse
    ) {
        this.overallScore = overallScore;
        this.violenceScore = violenceScore;
        this.romanceScore = romanceScore;
        this.humorScore = humorScore;
        this.contentLabel = contentLabel;
        this.targetAudience = targetAudience;
        this.summary = summary;
        this.providerRawResponse = providerRawResponse;
        this.status = AIAnalysisStatus.DONE;
    }

    public void approve(User approvedBy) {
        this.approvedBy = approvedBy;
        this.approvedAt = LocalDateTime.now();
        this.status = AIAnalysisStatus.APPROVED;
    }

    public void reject() {
        this.status = AIAnalysisStatus.REJECTED;
    }

    public void markFailed(String providerRawResponse) {
        this.providerRawResponse = providerRawResponse;
        this.status = AIAnalysisStatus.FAILED;
    }
}
