package com.sba301.cinemaai.repository;

import com.sba301.cinemaai.entity.AuditLog;
import com.sba301.cinemaai.entity.User;
import com.sba301.cinemaai.enums.AuditActionType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByActor(User actor);

    List<AuditLog> findByAction(AuditActionType action);

    List<AuditLog> findByTargetTypeAndTargetId(String targetType, Long targetId);
}
