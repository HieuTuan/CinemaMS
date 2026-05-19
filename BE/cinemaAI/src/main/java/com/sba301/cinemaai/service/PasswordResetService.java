package com.sba301.cinemaai.service;

import com.sba301.cinemaai.entity.PasswordResetToken;
import com.sba301.cinemaai.entity.User;
import com.sba301.cinemaai.exception.BadRequestException;
import com.sba301.cinemaai.exception.NotFoundException;
import com.sba301.cinemaai.repository.PasswordResetTokenRepository;
import com.sba301.cinemaai.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public PasswordResetToken request(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return passwordResetTokenRepository.save(
                new PasswordResetToken(user, UUID.randomUUID().toString(), LocalDateTime.now().plusMinutes(30))
        );
    }

    @Transactional
    public void confirm(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid password reset token"));
        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Password reset token is expired or already used");
        }

        resetToken.getUser().changePassword(passwordEncoder.encode(newPassword));
        resetToken.markUsed();
    }
}
