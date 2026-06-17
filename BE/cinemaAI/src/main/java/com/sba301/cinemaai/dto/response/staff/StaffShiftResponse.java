package com.sba301.cinemaai.dto.response.staff;

import com.sba301.cinemaai.entity.StaffShift;
import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record StaffShiftResponse(
        Long id,
        Long staffProfileId,
        String staffEmployeeCode,
        String staffFullName,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String note,
        LocalDateTime createdAt
) {

    public static StaffShiftResponse from(StaffShift shift) {
        return StaffShiftResponse.builder()
                .id(shift.getId())
                .staffProfileId(shift.getStaffProfile().getId())
                .staffEmployeeCode(shift.getStaffProfile().getEmployeeCode())
                .staffFullName(shift.getStaffProfile().getUser().getFullName())
                .startTime(shift.getStartTime())
                .endTime(shift.getEndTime())
                .note(shift.getNote())
                .createdAt(shift.getCreatedAt())
                .build();
    }
}
