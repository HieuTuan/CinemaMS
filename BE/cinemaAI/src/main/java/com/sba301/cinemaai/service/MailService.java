package com.sba301.cinemaai.service;

import com.sba301.cinemaai.entity.Booking;
import com.sba301.cinemaai.entity.BookingFoodItem;
import com.sba301.cinemaai.entity.BookingSeat;
import com.sba301.cinemaai.entity.BookingTicket;
import com.sba301.cinemaai.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("HH:mm, dd/MM/yyyy");

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${app.mail.enabled:false}")
    private boolean enabled;

    @Value("${app.mail.from:}")
    private String from;

    // -------------------------------------------------------------------------
    // OTP
    // -------------------------------------------------------------------------

    public void sendOtp(String to, String otp, String purpose) {
        if (!enabled) {
            log.warn("OTP email was not sent because MAIL_ENABLED/app.mail.enabled is false");
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

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject("CinemaAI - Mã xác minh của bạn");
            helper.setText(buildOtpEmail(purpose, otp), true);
            mailSender.send(message);
        } catch (MailException | MessagingException exception) {
            throw new BadRequestException("Could not send OTP email");
        }
    }

    // -------------------------------------------------------------------------
    // Booking emails (async - không chặn luồng chính)
    // -------------------------------------------------------------------------

    @Async
    public void sendBookingConfirmation(
            Booking booking,
            List<BookingSeat> seats,
            List<BookingTicket> tickets,
            List<BookingFoodItem> foods
    ) {
        if (!enabled) {
            log.warn("Booking confirmation email skipped (mail disabled)");
            return;
        }
        String to = booking.getUser().getEmail();
        try {
            send(to, "CinemaAI - Xác nhận đặt vé " + booking.getBookingCode(),
                    buildBookingConfirmationEmail(booking, seats, tickets, foods));
            log.info("Sent booking confirmation email to {} for booking {}", to, booking.getBookingCode());
        } catch (Exception e) {
            log.warn("Could not send booking confirmation email to {}: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendTicketEmail(
            Booking booking,
            List<BookingSeat> seats,
            List<BookingTicket> tickets,
            List<BookingFoodItem> foods
    ) {
        if (!enabled) {
            log.warn("Ticket email skipped (mail disabled)");
            return;
        }
        String to = booking.getUser().getEmail();
        try {
            send(to, "CinemaAI - Vé điện tử " + booking.getBookingCode(),
                    buildTicketEmail(booking, seats));
            log.info("Sent ticket email to {} for booking {}", to, booking.getBookingCode());
        } catch (Exception e) {
            log.warn("Could not send ticket email to {}: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendCancellationEmail(Booking booking) {
        if (!enabled) {
            log.warn("Cancellation email skipped (mail disabled)");
            return;
        }
        String to = booking.getUser().getEmail();
        try {
            send(to, "CinemaAI - Huỷ đặt vé " + booking.getBookingCode(),
                    buildCancellationEmail(booking));
            log.info("Sent cancellation email to {} for booking {}", to, booking.getBookingCode());
        } catch (Exception e) {
            log.warn("Could not send cancellation email to {}: {}", to, e.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private void send(String to, String subject, String html) {
        if (from == null || from.isBlank()) {
            log.warn("Mail sender address is not configured, skipping email to {}", to);
            return;
        }
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("JavaMailSender not available, skipping email to {}", to);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MailException | MessagingException e) {
            log.warn("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // HTML templates
    // -------------------------------------------------------------------------

    private String buildOtpEmail(String purpose, String otp) {
        return """
                <!doctype html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                            background: #f4f6f8;
                            color: #1f2937;
                            font-family: Arial, Helvetica, sans-serif;
                        }
                        .wrapper {
                            width: 100%%;
                            padding: 32px 0;
                            background: #f4f6f8;
                        }
                        .container {
                            max-width: 560px;
                            margin: 0 auto;
                            background: #ffffff;
                            border: 1px solid #e5e7eb;
                            border-radius: 8px;
                            overflow: hidden;
                        }
                        .header {
                            padding: 24px 28px;
                            background: #111827;
                            color: #ffffff;
                        }
                        .brand {
                            margin: 0;
                            font-size: 24px;
                            font-weight: 700;
                            letter-spacing: 0;
                        }
                        .tagline {
                            margin: 6px 0 0;
                            color: #d1d5db;
                            font-size: 14px;
                        }
                        .content {
                            padding: 28px;
                        }
                        .title {
                            margin: 0 0 12px;
                            color: #111827;
                            font-size: 20px;
                            font-weight: 700;
                        }
                        .text {
                            margin: 0 0 18px;
                            color: #4b5563;
                            font-size: 15px;
                            line-height: 1.6;
                        }
                        .otp-box {
                            margin: 24px 0;
                            padding: 20px;
                            background: #fff7ed;
                            border: 1px solid #fed7aa;
                            border-radius: 8px;
                            text-align: center;
                        }
                        .otp-label {
                            margin: 0 0 8px;
                            color: #9a3412;
                            font-size: 13px;
                            font-weight: 700;
                            text-transform: uppercase;
                        }
                        .otp-code {
                            margin: 0;
                            color: #111827;
                            font-size: 34px;
                            font-weight: 700;
                            letter-spacing: 6px;
                        }
                        .notice {
                            margin: 20px 0 0;
                            padding: 14px 16px;
                            background: #f9fafb;
                            border-left: 4px solid #f97316;
                            color: #4b5563;
                            font-size: 14px;
                            line-height: 1.5;
                        }
                        .footer {
                            padding: 18px 28px;
                            background: #f9fafb;
                            border-top: 1px solid #e5e7eb;
                            color: #6b7280;
                            font-size: 13px;
                            line-height: 1.5;
                        }
                    </style>
                </head>
                <body>
                    <div class="wrapper">
                        <div class="container">
                            <div class="header">
                                <p class="brand">CinemaAI</p>
                                <p class="tagline">Trải nghiệm điện ảnh của bạn bắt đầu tại đây.</p>
                            </div>
                            <div class="content">
                                <h1 class="title">Mã xác minh của bạn</h1>
                                <p class="text">Xin chào,</p>
                                <p class="text">Cảm ơn bạn đã lựa chọn CinemaAI. Vui lòng sử dụng mã bên dưới để tiếp tục thao tác: %s.</p>
                                <div class="otp-box">
                                    <p class="otp-label">Mã xác minh</p>
                                    <p class="otp-code">%s</p>
                                </div>
                                <p class="notice">Mã này có hiệu lực trong 1 phút 30 giây. Để bảo vệ tài khoản, vui lòng không chia sẻ mã này với bất kỳ ai.</p>
                                <p class="text" style="margin-top: 20px;">Nếu bạn không yêu cầu mã này, bạn có thể bỏ qua email này.</p>
                            </div>
                            <div class="footer">
                                CinemaAI<br>
                                Nền tảng đặt vé và trải nghiệm điện ảnh trực tuyến.
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(purpose, otp);
    }

    private String buildBookingConfirmationEmail(
            Booking booking,
            List<BookingSeat> seats,
            List<BookingTicket> tickets,
            List<BookingFoodItem> foods
    ) {
        String customerName = safeFullName(booking);
        String movieTitle = booking.getShowtime().getMovie().getTitle();
        String cinemaName = booking.getShowtime().getRoom().getCinema().getName();
        String roomName = booking.getShowtime().getRoom().getName();
        String startTime = booking.getShowtime().getStartTime().format(DT_FMT);
        String bookingCode = booking.getBookingCode();
        String totalAmount = formatVnd(booking.getTotalAmount());

        StringBuilder seatRows = new StringBuilder();
        for (BookingSeat bs : seats) {
            seatRows.append("""
                    <tr>
                        <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;">%s%d</td>
                        <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;">%s</td>
                        <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;text-align:right;">%s</td>
                    </tr>
                    """.formatted(
                    bs.getSeat().getRowLabel(),
                    bs.getSeat().getSeatNumber(),
                    bs.getSeat().getSeatType().name(),
                    formatVnd(bs.getUnitPrice())
            ));
        }

        StringBuilder ticketRows = new StringBuilder();
        for (BookingTicket bt : tickets) {
            ticketRows.append("""
                    <tr>
                        <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;">%s</td>
                        <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;text-align:center;">%d</td>
                        <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;text-align:right;">%s</td>
                    </tr>
                    """.formatted(
                    bt.getTicketType().name(),
                    bt.getQuantity(),
                    formatVnd(bt.getLineTotal())
            ));
        }

        StringBuilder foodRows = new StringBuilder();
        for (BookingFoodItem fi : foods) {
            String name = fi.getFoodItem() != null ? fi.getFoodItem().getName() : fi.getFoodCombo().getName();
            BigDecimal lineTotal = fi.getUnitPrice().multiply(BigDecimal.valueOf(fi.getQuantity()));
            foodRows.append("""
                    <tr>
                        <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;">%s</td>
                        <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;text-align:center;">x%d</td>
                        <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;text-align:right;">%s</td>
                    </tr>
                    """.formatted(name, fi.getQuantity(), formatVnd(lineTotal)));
        }

        String foodSection = foods.isEmpty() ? "" : """
                <h3 style="margin:20px 0 8px;color:#111827;font-size:15px;">Đồ ăn & thức uống</h3>
                <table style="width:100%%;border-collapse:collapse;font-size:14px;">
                    <thead>
                        <tr style="background:#f9fafb;">
                            <th style="padding:6px 8px;text-align:left;color:#6b7280;font-weight:600;">Sản phẩm</th>
                            <th style="padding:6px 8px;text-align:center;color:#6b7280;font-weight:600;">SL</th>
                            <th style="padding:6px 8px;text-align:right;color:#6b7280;font-weight:600;">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>%s</tbody>
                </table>
                """.formatted(foodRows);

        String ticketSection = tickets.isEmpty() ? "" : """
                <h3 style="margin:20px 0 8px;color:#111827;font-size:15px;">Loại vé</h3>
                <table style="width:100%%;border-collapse:collapse;font-size:14px;">
                    <thead>
                        <tr style="background:#f9fafb;">
                            <th style="padding:6px 8px;text-align:left;color:#6b7280;font-weight:600;">Loại</th>
                            <th style="padding:6px 8px;text-align:center;color:#6b7280;font-weight:600;">SL</th>
                            <th style="padding:6px 8px;text-align:right;color:#6b7280;font-weight:600;">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>%s</tbody>
                </table>
                """.formatted(ticketRows);

        return emailWrapper("""
                <h1 style="margin:0 0 12px;color:#111827;font-size:20px;font-weight:700;">Đặt vé thành công!</h1>
                <p style="margin:0 0 18px;color:#4b5563;font-size:15px;line-height:1.6;">Xin chào <strong>%s</strong>,</p>
                <p style="margin:0 0 18px;color:#4b5563;font-size:15px;line-height:1.6;">
                    Đặt vé của bạn đã được xác nhận. Dưới đây là thông tin chi tiết.
                </p>

                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
                    <div style="font-size:13px;color:#6b7280;margin-bottom:4px;text-transform:uppercase;font-weight:700;">Mã đặt vé</div>
                    <div style="font-size:22px;font-weight:700;color:#111827;letter-spacing:2px;">%s</div>
                </div>

                <table style="width:100%%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
                    <tr><td style="padding:6px 0;color:#6b7280;width:40%%;">Phim</td><td style="padding:6px 0;font-weight:600;color:#111827;">%s</td></tr>
                    <tr><td style="padding:6px 0;color:#6b7280;">Rạp</td><td style="padding:6px 0;color:#374151;">%s</td></tr>
                    <tr><td style="padding:6px 0;color:#6b7280;">Phòng chiếu</td><td style="padding:6px 0;color:#374151;">%s</td></tr>
                    <tr><td style="padding:6px 0;color:#6b7280;">Suất chiếu</td><td style="padding:6px 0;color:#374151;">%s</td></tr>
                </table>

                <h3 style="margin:0 0 8px;color:#111827;font-size:15px;">Ghế đã chọn</h3>
                <table style="width:100%%;border-collapse:collapse;font-size:14px;">
                    <thead>
                        <tr style="background:#f9fafb;">
                            <th style="padding:6px 8px;text-align:left;color:#6b7280;font-weight:600;">Ghế</th>
                            <th style="padding:6px 8px;text-align:left;color:#6b7280;font-weight:600;">Loại</th>
                            <th style="padding:6px 8px;text-align:right;color:#6b7280;font-weight:600;">Giá</th>
                        </tr>
                    </thead>
                    <tbody>%s</tbody>
                </table>

                %s
                %s

                <div style="margin-top:20px;padding:14px 16px;background:#ecfdf5;border:1px solid #6ee7b7;border-radius:8px;display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:15px;font-weight:600;color:#065f46;">Tổng thanh toán</span>
                    <span style="font-size:20px;font-weight:700;color:#065f46;">%s</span>
                </div>

                <p style="margin:20px 0 0;color:#6b7280;font-size:13px;line-height:1.5;">
                    Vui lòng kiểm tra email này để nhận vé điện tử. Chúc bạn xem phim vui vẻ!
                </p>
                """.formatted(
                customerName, bookingCode,
                movieTitle, cinemaName, roomName, startTime,
                seatRows, ticketSection, foodSection,
                totalAmount
        ));
    }

    private String buildTicketEmail(Booking booking, List<BookingSeat> seats) {
        String customerName = safeFullName(booking);
        String movieTitle = booking.getShowtime().getMovie().getTitle();
        String cinemaName = booking.getShowtime().getRoom().getCinema().getName();
        String roomName = booking.getShowtime().getRoom().getName();
        String startTime = booking.getShowtime().getStartTime().format(DT_FMT);
        String bookingCode = booking.getBookingCode();
        String qrValue = booking.getQrCode() != null ? booking.getQrCode() : bookingCode;

        StringBuilder seatList = new StringBuilder();
        for (BookingSeat bs : seats) {
            seatList.append("<li style=\"margin:4px 0;color:#374151;\">")
                    .append("Ghế ").append(bs.getSeat().getRowLabel()).append(bs.getSeat().getSeatNumber())
                    .append(" (").append(bs.getSeat().getSeatType().name()).append(")")
                    .append("</li>");
        }

        return emailWrapper("""
                <h1 style="margin:0 0 12px;color:#111827;font-size:20px;font-weight:700;">Vé điện tử của bạn</h1>
                <p style="margin:0 0 18px;color:#4b5563;font-size:15px;line-height:1.6;">Xin chào <strong>%s</strong>,</p>
                <p style="margin:0 0 18px;color:#4b5563;font-size:15px;line-height:1.6;">
                    Thanh toán thành công! Dưới đây là vé điện tử của bạn. Vui lòng xuất trình mã vé khi vào cửa.
                </p>

                <div style="background:#111827;border-radius:12px;padding:24px;margin-bottom:20px;text-align:center;">
                    <div style="color:#d1d5db;font-size:13px;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">Mã QR vé</div>
                    <div style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:3px;word-break:break-all;">%s</div>
                    <div style="margin-top:12px;color:#9ca3af;font-size:12px;">Xuất trình mã này tại quầy hoặc máy quét QR</div>
                </div>

                <table style="width:100%%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
                    <tr><td style="padding:8px 0;color:#6b7280;width:40%%;">Phim</td><td style="padding:8px 0;font-weight:600;color:#111827;">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#6b7280;">Rạp</td><td style="padding:8px 0;color:#374151;">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#6b7280;">Phòng chiếu</td><td style="padding:8px 0;color:#374151;">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#6b7280;">Suất chiếu</td><td style="padding:8px 0;color:#374151;">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#6b7280;">Mã đặt vé</td><td style="padding:8px 0;font-weight:600;color:#111827;">%s</td></tr>
                </table>

                <h3 style="margin:0 0 8px;color:#111827;font-size:15px;">Ghế đã đặt</h3>
                <ul style="margin:0 0 20px;padding-left:20px;">%s</ul>

                <div style="padding:14px 16px;background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;">
                    <p style="margin:0;color:#92400e;font-size:14px;line-height:1.5;">
                        ⚠️ Vui lòng đến trước giờ chiếu ít nhất <strong>15 phút</strong>. Vé không hoàn trả sau khi đã sử dụng.
                    </p>
                </div>
                """.formatted(
                customerName,
                qrValue,
                movieTitle, cinemaName, roomName, startTime, bookingCode,
                seatList
        ));
    }

    private String buildCancellationEmail(Booking booking) {
        String customerName = safeFullName(booking);
        String movieTitle = booking.getShowtime().getMovie().getTitle();
        String cinemaName = booking.getShowtime().getRoom().getCinema().getName();
        String startTime = booking.getShowtime().getStartTime().format(DT_FMT);
        String bookingCode = booking.getBookingCode();
        String totalAmount = formatVnd(booking.getTotalAmount());

        boolean isRefundRequested = booking.getRefundReason() != null;
        String refundSection = isRefundRequested ? """
                <div style="margin-top:20px;padding:14px 16px;background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;">
                    <div style="font-weight:600;color:#1e40af;margin-bottom:4px;">Trạng thái hoàn tiền</div>
                    <div style="color:#374151;font-size:14px;">Yêu cầu hoàn tiền của bạn đã được ghi nhận và đang được xử lý.
                    Số tiền <strong>%s</strong> sẽ được hoàn trả trong vòng 3–5 ngày làm việc.</div>
                </div>
                """.formatted(totalAmount) : "";

        return emailWrapper("""
                <h1 style="margin:0 0 12px;color:#111827;font-size:20px;font-weight:700;">Đặt vé đã bị huỷ</h1>
                <p style="margin:0 0 18px;color:#4b5563;font-size:15px;line-height:1.6;">Xin chào <strong>%s</strong>,</p>
                <p style="margin:0 0 18px;color:#4b5563;font-size:15px;line-height:1.6;">
                    Đặt vé <strong>%s</strong> của bạn đã bị huỷ.
                </p>

                <table style="width:100%%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
                    <tr><td style="padding:8px 0;color:#6b7280;width:40%%;">Phim</td><td style="padding:8px 0;font-weight:600;color:#111827;">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#6b7280;">Rạp</td><td style="padding:8px 0;color:#374151;">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#6b7280;">Suất chiếu</td><td style="padding:8px 0;color:#374151;">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#6b7280;">Số tiền</td><td style="padding:8px 0;color:#374151;">%s</td></tr>
                </table>

                %s

                <p style="margin:20px 0 0;color:#6b7280;font-size:13px;line-height:1.5;">
                    Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với bộ phận hỗ trợ.
                </p>
                """.formatted(
                customerName, bookingCode,
                movieTitle, cinemaName, startTime, totalAmount,
                refundSection
        ));
    }

    private String emailWrapper(String body) {
        return """
                <!doctype html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin:0;padding:0;background:#f4f6f8;color:#1f2937;font-family:Arial,Helvetica,sans-serif;">
                    <div style="width:100%%;padding:32px 0;background:#f4f6f8;">
                        <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                            <div style="padding:24px 28px;background:#111827;color:#ffffff;">
                                <p style="margin:0;font-size:24px;font-weight:700;">CinemaAI</p>
                                <p style="margin:6px 0 0;color:#d1d5db;font-size:14px;">Trải nghiệm điện ảnh của bạn bắt đầu tại đây.</p>
                            </div>
                            <div style="padding:28px;">
                                %s
                            </div>
                            <div style="padding:18px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px;line-height:1.5;">
                                CinemaAI — Nền tảng đặt vé và trải nghiệm điện ảnh trực tuyến.
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(body);
    }

    private String safeFullName(Booking booking) {
        try {
            return booking.getUser().getFullName();
        } catch (Exception e) {
            return booking.getUser().getEmail();
        }
    }

    private String formatVnd(BigDecimal amount) {
        if (amount == null) return "0 ₫";
        return String.format("%,.0f ₫", amount);
    }
}
