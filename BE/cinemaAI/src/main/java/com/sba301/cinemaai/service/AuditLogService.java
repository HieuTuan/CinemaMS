package com.sba301.cinemaai.service;

import com.sba301.cinemaai.dto.response.PageResponse;
import com.sba301.cinemaai.dto.response.audit.AuditLogResponse;
import com.sba301.cinemaai.entity.AuditLog;
import com.sba301.cinemaai.entity.User;
import com.sba301.cinemaai.enums.AuditActionType;
import com.sba301.cinemaai.repository.AuditLogRepository;
import com.sba301.cinemaai.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public void log(
            User actor,
            AuditActionType action,
            String targetType,
            Long targetId,
            String detail,
            String ipAddress
    ) {
        auditLogRepository.save(new AuditLog(actor, action, targetType, targetId, detail, ipAddress));
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> search(
            Long actorId,
            AuditActionType action,
            String targetType,
            LocalDate from,
            LocalDate to,
            Pageable pageable
    ) {
        LocalDateTime fromDt = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDt   = to   != null ? to.plusDays(1).atStartOfDay() : null;

        return PageResponse.from(
                auditLogRepository.search(actorId, action, targetType, fromDt, toDt, pageable)
                        .map(AuditLogResponse::from)
        );
    }
}
