package com.sba301.cinemaai.repository;

import com.sba301.cinemaai.entity.Notification;
import com.sba301.cinemaai.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    List<Notification> findByUserAndReadAtIsNullOrderByCreatedAtDesc(User user);
}
