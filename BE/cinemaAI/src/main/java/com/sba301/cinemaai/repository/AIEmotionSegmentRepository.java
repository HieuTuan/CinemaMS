package com.sba301.cinemaai.repository;

import com.sba301.cinemaai.entity.AIAnalysis;
import com.sba301.cinemaai.entity.AIEmotionSegment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AIEmotionSegmentRepository extends JpaRepository<AIEmotionSegment, Long> {

    List<AIEmotionSegment> findByAnalysisOrderByStartMinuteAsc(AIAnalysis analysis);
}
