package com.sba301.cinemaai.dto.response.staff;

import com.sba301.cinemaai.entity.StaffProfile;
import com.sba301.cinemaai.enums.StaffStatus;
import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record StaffProfileResponse(
        Long id,
        Long userId,
        String userEmail,
        String userFullName,
        Long cinemaId,
        String cinemaName,
        String employeeCode,
        String position,
        StaffStatus status,
        LocalDateTime createdAt
) {

    public static StaffProfileResponse from(StaffProfile profile) {
        return StaffProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .userEmail(profile.getUser().getEmail())
                .userFullName(profile.getUser().getFullName())
                .cinemaId(profile.getCinema() != null ? profile.getCinema().getId() : null)
                .cinemaName(profile.getCinema() != null ? profile.getCinema().getName() : null)
                .employeeCode(profile.getEmployeeCode())
                .position(profile.getPosition())
                .status(profile.getStatus())
                .createdAt(profile.getCreatedAt())
                .build();
    }
}
