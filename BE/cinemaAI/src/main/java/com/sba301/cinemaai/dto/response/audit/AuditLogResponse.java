package com.sba301.cinemaai.dto.response.audit;

import com.sba301.cinemaai.entity.AuditLog;
import com.sba301.cinemaai.enums.AuditActionType;
import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record AuditLogResponse(
        Long id,
        Long actorUserId,
        String actorEmail,
        String actorFullName,
        AuditActionType action,
        String targetType,
        Long targetId,
        String detail,
        String ipAddress,
        LocalDateTime createdAt
) {

    public static AuditLogResponse from(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .actorUserId(log.getActor() != null ? log.getActor().getId() : null)
                .actorEmail(log.getActor() != null ? log.getActor().getEmail() : null)
                .actorFullName(log.getActor() != null ? log.getActor().getFullName() : null)
                .action(log.getAction())
                .targetType(log.getTargetType())
                .targetId(log.getTargetId())
                .detail(log.getDetail())
                .ipAddress(log.getIpAddress())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
