package com.sba301.cinemaai.controller;

import com.sba301.cinemaai.dto.response.ApiResponse;
import com.sba301.cinemaai.dto.response.PageResponse;
import com.sba301.cinemaai.dto.response.audit.AuditLogResponse;
import com.sba301.cinemaai.enums.AuditActionType;
import com.sba301.cinemaai.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/audit-logs")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Admin Audit Logs", description = "Audit log search - requires ADMIN role")
public class AdminAuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @Operation(
            summary = "Search audit logs",
            description = "Filter by actor, action type, target type and date range. Ordered newest first."
    )
    public ApiResponse<PageResponse<AuditLogResponse>> search(
            @RequestParam(required = false) Long actorId,
            @RequestParam(required = false) AuditActionType action,
            @RequestParam(required = false) String targetType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size
    ) {
        return ApiResponse.success(
                auditLogService.search(
                        actorId, action, targetType, from, to,
                        PageRequest.of(page, size, Sort.by("createdAt").descending())
                )
        );
    }
}
