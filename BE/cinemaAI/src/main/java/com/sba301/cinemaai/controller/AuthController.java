package com.sba301.cinemaai.controller;

import com.sba301.cinemaai.dto.auth.AuthResponse;
import com.sba301.cinemaai.dto.auth.EmailVerificationRequest;
import com.sba301.cinemaai.dto.auth.LoginRequest;
import com.sba301.cinemaai.dto.auth.LogoutRequest;
import com.sba301.cinemaai.dto.auth.PasswordResetConfirmRequest;
import com.sba301.cinemaai.dto.auth.PasswordResetRequest;
import com.sba301.cinemaai.dto.auth.RefreshTokenRequest;
import com.sba301.cinemaai.dto.auth.RegisterRequest;
import com.sba301.cinemaai.dto.auth.RegisterResponse;
import com.sba301.cinemaai.dto.auth.TokenResponse;
import com.sba301.cinemaai.dto.response.ApiResponse;
import com.sba301.cinemaai.service.AuthService;
import com.sba301.cinemaai.service.EmailVerificationService;
import com.sba301.cinemaai.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final EmailVerificationService emailVerificationService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success(authService.register(request), "Registered successfully");
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request), "Logged in successfully");
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ApiResponse.success(authService.refresh(request.refreshToken()), "Token refreshed successfully");
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@Valid @RequestBody LogoutRequest request) {
        authService.logout(request.refreshToken());
        return ApiResponse.success(null, "Logged out successfully");
    }

    @PostMapping("/verify-email")
    public ApiResponse<Void> verifyEmail(@Valid @RequestBody EmailVerificationRequest request) {
        emailVerificationService.verify(request.token());
        return ApiResponse.success(null, "Email verified successfully");
    }

    @PostMapping("/password-reset/request")
    public ApiResponse<TokenResponse> requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        return ApiResponse.success(
                new TokenResponse(passwordResetService.request(request.email()).getToken()),
                "Password reset token created"
        );
    }

    @PostMapping("/password-reset/confirm")
    public ApiResponse<Void> confirmPasswordReset(@Valid @RequestBody PasswordResetConfirmRequest request) {
        passwordResetService.confirm(request.token(), request.newPassword());
        return ApiResponse.success(null, "Password reset successfully");
    }
}
