package com.sba301.cinemaai.dto.auth;

import com.sba301.cinemaai.dto.user.UserProfileResponse;

public record RegisterResponse(
        UserProfileResponse user,
        String emailVerificationToken
) {
}
