package com.sba301.cinemaai.repository;

import com.sba301.cinemaai.entity.AuditLog;
import com.sba301.cinemaai.entity.User;
import com.sba301.cinemaai.enums.AuditActionType;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByActor(User actor);

    List<AuditLog> findByAction(AuditActionType action);

    List<AuditLog> findByTargetTypeAndTargetId(String targetType, Long targetId);

    @Query("""
            select a from AuditLog a
            where (:actorId    is null or a.actor.id = :actorId)
              and (:action     is null or a.action   = :action)
              and (:targetType is null or a.targetType = :targetType)
              and (:from       is null or a.createdAt >= :from)
              and (:to         is null or a.createdAt <  :to)
            order by a.createdAt desc
            """)
    Page<AuditLog> search(
            @Param("actorId")     Long actorId,
            @Param("action")      AuditActionType action,
            @Param("targetType")  String targetType,
            @Param("from")        LocalDateTime from,
            @Param("to")          LocalDateTime to,
            Pageable pageable
    );
}
