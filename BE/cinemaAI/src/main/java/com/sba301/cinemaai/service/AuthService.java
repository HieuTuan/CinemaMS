package com.sba301.cinemaai.service;

import com.sba301.cinemaai.dto.auth.AuthResponse;
import com.sba301.cinemaai.dto.auth.GoogleLoginRequest;
import com.sba301.cinemaai.dto.auth.GoogleOtpVerifyRequest;
import com.sba301.cinemaai.dto.auth.LoginRequest;
import com.sba301.cinemaai.dto.auth.PhoneOtpVerifyRequest;
import com.sba301.cinemaai.dto.auth.RegisterRequest;
import com.sba301.cinemaai.dto.auth.RegisterResponse;
import com.sba301.cinemaai.entity.RefreshToken;
import com.sba301.cinemaai.entity.User;
import com.sba301.cinemaai.enums.RoleName;
import com.sba301.cinemaai.enums.UserStatus;
import com.sba301.cinemaai.exception.ConflictException;
import com.sba301.cinemaai.exception.UnauthorizedException;
import com.sba301.cinemaai.repository.UserRepository;
import com.sba301.cinemaai.security.JwtProperties;
import com.sba301.cinemaai.security.JwtService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final RefreshTokenService refreshTokenService;
    private final EmailVerificationService emailVerificationService;
    private final PhoneVerificationService phoneVerificationService;
    private final UserRoleService userRoleService;
    private final UserService userService;
    private final GoogleTokenVerifier googleTokenVerifier;

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already exists");
        }
        if (request.phone() != null && !request.phone().isBlank()
                && userRepository.existsByPhone(request.phone())) {
            throw new ConflictException("Phone already exists");
        }

        User user = userRepository.save(new User(
                request.email(),
                passwordEncoder.encode(request.password()),
                request.fullName(),
                request.phone()
        ));
        userRoleService.assignRole(user, RoleName.CUSTOMER);
        emailVerificationService.create(user);
        return new RegisterResponse(
                userService.toProfile(user),
                true,
                10
        );
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );
        } catch (DisabledException exception) {
            throw new UnauthorizedException("User is disabled or email is not verified");
        } catch (BadCredentialsException exception) {
            throw new UnauthorizedException("Invalid username or password");
        }

        User user = userService.getByEmail(request.username());
        return createAuthResponse(user);
    }

    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        GoogleTokenVerifier.GoogleTokenInfo tokenInfo = googleTokenVerifier.verify(request.credential());
        User user = userRepository.findByEmail(tokenInfo.email())
                .orElseGet(() -> createGoogleUser(tokenInfo));

        if (user.getStatus() == UserStatus.DISABLED) {
            throw new UnauthorizedException("User is disabled");
        }
        if (!user.isEmailVerified()) {
            user.activateEmail();
        }

        return createAuthResponse(user);
    }

    @Transactional
    public AuthResponse loginWithGoogleOtp(GoogleOtpVerifyRequest request) {
        User user = emailVerificationService.verifyGoogleLogin(request.email(), request.otp());
        if (user.getStatus() == UserStatus.DISABLED) {
            throw new UnauthorizedException("User is disabled");
        }
        return createAuthResponse(user);
    }

    @Transactional
    public AuthResponse loginWithOtp(PhoneOtpVerifyRequest request) {
        return createAuthResponse(phoneVerificationService.verifyLoginOtp(request.phone(), request.otp()));
    }

    @Transactional
    public AuthResponse refresh(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenService.validate(refreshTokenValue);
        return createAuthResponse(refreshToken.getUser());
    }

    @Transactional
    public void logout(String refreshTokenValue) {
        refreshTokenService.revoke(refreshTokenValue);
    }

    private User createGoogleUser(GoogleTokenVerifier.GoogleTokenInfo tokenInfo) {
        String fullName = tokenInfo.name();
        if (fullName == null || fullName.isBlank()) {
            fullName = tokenInfo.email();
        }

        User user = userRepository.save(new User(
                tokenInfo.email(),
                passwordEncoder.encode(tokenInfo.subject()),
                fullName,
                null
        ));
        user.activateEmail();
        userRoleService.assignRole(user, RoleName.CUSTOMER);
        return user;
    }

    private AuthResponse createAuthResponse(User user) {
        List<String> roles = userRoleService.getRoleNames(user.getId());
        RefreshToken refreshToken = refreshTokenService.create(user);
        return new AuthResponse(
                jwtService.generateAccessToken(user.getEmail(), roles),
                refreshToken.getToken(),
                "Bearer",
                jwtProperties.accessExpirationMs(),
                userService.toProfile(user),
                roles
        );
    }
}
