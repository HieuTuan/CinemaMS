package com.sba301.cinemaai.dto.user;

import com.sba301.cinemaai.enums.UserStatus;
import java.time.LocalDateTime;
import java.util.List;

public record UserProfileResponse(
        Long id,
        String email,
        String fullName,
        String phone,
        UserStatus status,
        boolean emailVerified,
        List<String> roles,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
