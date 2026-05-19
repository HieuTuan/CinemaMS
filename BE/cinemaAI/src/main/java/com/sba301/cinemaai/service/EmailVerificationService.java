package com.sba301.cinemaai.service;

import com.sba301.cinemaai.entity.EmailVerificationToken;
import com.sba301.cinemaai.entity.User;
import com.sba301.cinemaai.exception.BadRequestException;
import com.sba301.cinemaai.repository.EmailVerificationTokenRepository;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Transactional
    public EmailVerificationToken create(User user) {
        return emailVerificationTokenRepository.save(
                new EmailVerificationToken(user, UUID.randomUUID().toString(), LocalDateTime.now().plusHours(24))
        );
    }

    @Transactional
    public void verify(String token) {
        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid verification token"));
        if (verificationToken.isUsed() || verificationToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Verification token is expired or already used");
        }

        verificationToken.getUser().activateEmail();
        verificationToken.markUsed();
    }
}
