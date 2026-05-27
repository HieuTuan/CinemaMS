package com.sba301.cinemaai.controller;

import com.sba301.cinemaai.dto.auth.AuthResponse;
import com.sba301.cinemaai.dto.auth.EmailOtpRequest;
import com.sba301.cinemaai.dto.auth.EmailVerificationRequest;
import com.sba301.cinemaai.dto.auth.GoogleLoginRequest;
import com.sba301.cinemaai.dto.auth.GoogleOtpVerifyRequest;
import com.sba301.cinemaai.dto.auth.LoginRequest;
import com.sba301.cinemaai.dto.auth.LogoutRequest;
import com.sba301.cinemaai.dto.auth.PasswordResetConfirmRequest;
import com.sba301.cinemaai.dto.auth.PasswordResetRequest;
import com.sba301.cinemaai.dto.auth.PhoneOtpRequest;
import com.sba301.cinemaai.dto.auth.PhoneOtpVerifyRequest;
import com.sba301.cinemaai.dto.auth.PhoneVerificationRequest;
import com.sba301.cinemaai.dto.auth.RefreshTokenRequest;
import com.sba301.cinemaai.dto.auth.RegisterRequest;
import com.sba301.cinemaai.dto.auth.RegisterResponse;
import com.sba301.cinemaai.dto.auth.TokenResponse;
import com.sba301.cinemaai.dto.response.ApiResponse;
import com.sba301.cinemaai.service.AuthService;
import com.sba301.cinemaai.service.EmailVerificationService;
import com.sba301.cinemaai.service.PasswordResetService;
import com.sba301.cinemaai.service.PhoneVerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final EmailVerificationService emailVerificationService;
    private final PhoneVerificationService phoneVerificationService;
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

    @PostMapping("/google")
    public ApiResponse<AuthResponse> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        return ApiResponse.success(authService.loginWithGoogle(request), "Logged in with Google successfully");
    }

    @PostMapping("/google/verify")
    public ApiResponse<AuthResponse> loginWithGoogleOtp(@Valid @RequestBody GoogleOtpVerifyRequest request) {
        return ApiResponse.success(authService.loginWithGoogleOtp(request), "Logged in with Google successfully");
    }

    @PostMapping("/otp/request")
    public ApiResponse<TokenResponse> requestOtp(@Valid @RequestBody PhoneOtpRequest request) {
        return ApiResponse.success(
                new TokenResponse(phoneVerificationService.createLoginOtp(request.phone()).getOtp()),
                "OTP created"
        );
    }

    @PostMapping("/otp/verify")
    public ApiResponse<AuthResponse> loginWithOtp(@Valid @RequestBody PhoneOtpVerifyRequest request) {
        return ApiResponse.success(authService.loginWithOtp(request), "Logged in with OTP successfully");
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
        emailVerificationService.verifyEmail(request.email(), request.otp());
        return ApiResponse.success(null, "Email verified successfully");
    }

    @PostMapping("/verify-email/request")
    public ApiResponse<Void> requestEmailVerificationOtp(@Valid @RequestBody EmailOtpRequest request) {
        emailVerificationService.resendVerificationOtp(request.email());
        return ApiResponse.success(null, "Email verification OTP sent");
    }

    @PostMapping("/verify-phone")
    public ApiResponse<Void> verifyPhone(@Valid @RequestBody PhoneVerificationRequest request) {
        phoneVerificationService.verifyPhone(request.phone(), request.otp());
        return ApiResponse.success(null, "Phone verified successfully");
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
