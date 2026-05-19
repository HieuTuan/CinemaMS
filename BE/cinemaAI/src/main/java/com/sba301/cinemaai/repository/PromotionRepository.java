package com.sba301.cinemaai.repository;

import com.sba301.cinemaai.entity.Promotion;
import com.sba301.cinemaai.enums.PromotionStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    Optional<Promotion> findByCode(String code);

    boolean existsByCode(String code);

    List<Promotion> findByStatus(PromotionStatus status);
}
