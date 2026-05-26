package com.sba301.cinemaai.service;

import com.sba301.cinemaai.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${app.mail.enabled:false}")
    private boolean enabled;

    @Value("${app.mail.from:}")
    private String from;

    public void sendOtp(String to, String otp, String purpose) {
        if (!enabled) {
            return;
        }
        if (to == null || to.isBlank()) {
            throw new BadRequestException("Recipient email is required");
        }
        if (from == null || from.isBlank()) {
            throw new BadRequestException("Mail sender is not configured");
        }
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            throw new BadRequestException("Mail sender is not configured");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject("CinemaAI OTP");
        message.setText("""
                Your CinemaAI OTP is: %s

                Purpose: %s
                This OTP will expire shortly.
                """.formatted(otp, purpose));

        try {
            mailSender.send(message);
        } catch (MailException exception) {
            throw new BadRequestException("Could not send OTP email");
        }
    }
}
