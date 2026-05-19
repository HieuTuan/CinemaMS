package com.sba301.cinemaai.service;

import com.sba301.cinemaai.entity.RefreshToken;
import com.sba301.cinemaai.entity.User;
import com.sba301.cinemaai.exception.UnauthorizedException;
import com.sba301.cinemaai.repository.RefreshTokenRepository;
import com.sba301.cinemaai.security.JwtProperties;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProperties jwtProperties;

    @Transactional
    public RefreshToken create(User user) {
        LocalDateTime expiresAt = LocalDateTime.now().plusNanos(jwtProperties.refreshExpirationMs() * 1_000_000);
        return refreshTokenRepository.save(new RefreshToken(user, UUID.randomUUID().toString(), expiresAt));
    }

    @Transactional(readOnly = true)
    public RefreshToken validate(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));
        if (refreshToken.isRevoked() || refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Refresh token is expired or revoked");
        }
        return refreshToken;
    }

    @Transactional
    public void revoke(String token) {
        refreshTokenRepository.findByToken(token).ifPresent(refreshToken -> {
            refreshToken.revoke();
            refreshTokenRepository.save(refreshToken);
        });
    }

    @Transactional
    public void revokeAll(User user) {
        refreshTokenRepository.findByUserAndRevokedFalse(user)
                .forEach(RefreshToken::revoke);
    }
}
