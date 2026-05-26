package com.sba301.cinemaai.controller;

import com.sba301.cinemaai.dto.response.ApiResponse;
import com.sba301.cinemaai.dto.auth.TokenResponse;
import com.sba301.cinemaai.dto.user.UserProfileResponse;
import com.sba301.cinemaai.dto.user.UserProfileUpdateRequest;
import com.sba301.cinemaai.security.AuthenticatedUser;
import com.sba301.cinemaai.service.PhoneVerificationService;
import com.sba301.cinemaai.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final PhoneVerificationService phoneVerificationService;

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> currentUser(@AuthenticationPrincipal AuthenticatedUser user) {
        return ApiResponse.success(userService.getProfile(user.email()));
    }

    @PutMapping("/me")
    public ApiResponse<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody UserProfileUpdateRequest request
    ) {
        return ApiResponse.success(userService.updateProfile(user.email(), request), "Profile updated successfully");
    }

    @PostMapping("/me/phone-verification/request")
    public ApiResponse<TokenResponse> requestPhoneVerification(@AuthenticationPrincipal AuthenticatedUser user) {
        return ApiResponse.success(
                new TokenResponse(phoneVerificationService.createPhoneVerificationOtp(userService.getByEmail(user.email())).getOtp()),
                "Phone verification OTP created"
        );
    }
}
