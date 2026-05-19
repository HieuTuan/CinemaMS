package com.sba301.cinemaai.repository;

import com.sba301.cinemaai.entity.LoyaltyPoint;
import com.sba301.cinemaai.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoyaltyPointRepository extends JpaRepository<LoyaltyPoint, Long> {

    List<LoyaltyPoint> findByUserOrderByCreatedAtDesc(User user);
}
