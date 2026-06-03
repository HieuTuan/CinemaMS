package com.sba301.cinemaai.repository;

import com.sba301.cinemaai.entity.Promotion;
import com.sba301.cinemaai.enums.PromotionStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    Optional<Promotion> findByCode(String code);

    Optional<Promotion> findByCodeAndStatus(String code, PromotionStatus status);

    @Query("""
            SELECT p FROM Promotion p
            WHERE p.code = :code
              AND p.status = 'ACTIVE'
              AND p.startsAt <= :now
              AND p.endsAt >= :now
            """)
    Optional<Promotion> findActiveByCode(@Param("code") String code,
                                         @Param("now") LocalDateTime now);

    @Query("""
            SELECT p FROM Promotion p
            WHERE p.status = 'ACTIVE'
              AND p.endsAt < :now
            """)
    List<Promotion> findExpiredPromotions(@Param("now") LocalDateTime now);

    boolean existsByCode(String code);

    @Query("""
            SELECT p FROM Promotion p
            WHERE p.requiredPoints IS NOT NULL
              AND p.status = :status
            """)
    List<Promotion> findByRequiredPointsNotNull(@Param("status") PromotionStatus status);

    @Query("""
            SELECT p FROM Promotion p
            WHERE p.status = 'ACTIVE'
              AND p.startsAt <= :now
              AND p.endsAt >= :now
            """)
    List<Promotion> findAllActive(@Param("now") LocalDateTime now);
}
