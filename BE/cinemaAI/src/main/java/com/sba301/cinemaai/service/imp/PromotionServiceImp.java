package com.sba301.cinemaai.service.imp;

import com.sba301.cinemaai.dto.promotion.ApplyPromotionResponse;
import com.sba301.cinemaai.dto.promotion.PromotionResponse;
import com.sba301.cinemaai.entity.Booking;
import com.sba301.cinemaai.entity.BookingPromotion;
import com.sba301.cinemaai.entity.Promotion;
import com.sba301.cinemaai.exception.BadRequestException;
import com.sba301.cinemaai.exception.NotFoundException;
import com.sba301.cinemaai.repository.BookingPromotionRepository;
import com.sba301.cinemaai.repository.BookingRepository;
import com.sba301.cinemaai.repository.PromotionRepository;
import com.sba301.cinemaai.service.PromotionService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PromotionServiceImp implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final BookingRepository bookingRepository;
    private final BookingPromotionRepository bookingPromotionRepository;

    @Override
    @Transactional
    public ApplyPromotionResponse applyPromotion(Long bookingId, String code) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found: " + bookingId));

        if (bookingPromotionRepository.existsByBookingId(bookingId)) {
            throw new BadRequestException("A promotion has already been applied to this booking");
        }

        Promotion promo = promotionRepository
                .findActiveByCode(code, LocalDateTime.now())
                .orElseThrow(() -> new NotFoundException("Promotion not found or inactive: " + code));

        validateUsageLimit(promo);
        validateMinOrder(promo, booking.getSubtotal());

        BigDecimal discount = calculateDiscount(promo, booking.getSubtotal());

        booking.updateAmounts(
                booking.getSubtotal(),
                discount,
                booking.getSubtotal().subtract(discount)
        );

        bookingPromotionRepository.save(new BookingPromotion(booking, promo, discount));
        promo.increaseUsage();

        return ApplyPromotionResponse.builder()
                .code(promo.getCode())
                .promotionName(promo.getName())
                .originalAmount(booking.getSubtotal())
                .discountAmount(discount)
                .finalAmount(booking.getTotalAmount())
                .message("Promotion applied successfully")
                .build();
    }

    @Override
    @Transactional
    public void removePromotion(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found: " + bookingId));

        BookingPromotion bp = bookingPromotionRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new BadRequestException("No promotion applied to this booking"));

        bookingPromotionRepository.delete(bp);
        booking.clearPromotion();
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionResponse getByCode(String code) {
        Promotion promo = promotionRepository.findByCode(code)
                .orElseThrow(() -> new NotFoundException("Promotion not found: " + code));
        return PromotionResponse.from(promo);
    }

    // -------------------------------------------------------- private helpers

    private void validateUsageLimit(Promotion promo) {
        if (promo.getUsageLimit() != null && promo.getUsedCount() >= promo.getUsageLimit()) {
            throw new BadRequestException("Promotion usage limit has been reached");
        }
    }

    private void validateMinOrder(Promotion promo, BigDecimal subtotal) {
        if (promo.getMinOrderAmount() != null
                && subtotal.compareTo(promo.getMinOrderAmount()) < 0) {
            throw new BadRequestException(
                    "Order amount does not meet minimum required: "
                            + promo.getMinOrderAmount().toPlainString());
        }
    }

    private BigDecimal calculateDiscount(Promotion promo, BigDecimal subtotal) {
        BigDecimal discount = promo.getType().calculate(subtotal, promo.getValue());

        if (promo.getMaxDiscountAmount() != null) {
            discount = discount.min(promo.getMaxDiscountAmount());
        }

        return discount.min(subtotal);
    }
}