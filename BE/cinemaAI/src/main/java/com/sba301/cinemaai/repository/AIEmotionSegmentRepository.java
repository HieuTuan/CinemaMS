package com.sba301.cinemaai.repository;

import com.sba301.cinemaai.entity.AIAnalysis;
import com.sba301.cinemaai.entity.AIEmotionSegment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AIEmotionSegmentRepository extends JpaRepository<AIEmotionSegment, Long> {

    List<AIEmotionSegment> findByAnalysisOrderByStartMinuteAsc(AIAnalysis analysis);

    @Modifying
    @Query("delete from AIEmotionSegment segment where segment.analysis = :analysis")
    void deleteByAnalysis(@Param("analysis") AIAnalysis analysis);
}
