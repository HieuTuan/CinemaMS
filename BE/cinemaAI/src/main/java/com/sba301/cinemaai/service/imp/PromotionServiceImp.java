package com.sba301.cinemaai.service.imp;

import com.sba301.cinemaai.dto.promotion.ApplyPromotionResponse;
import com.sba301.cinemaai.dto.promotion.PromotionCombinationCheckRequest;
import com.sba301.cinemaai.dto.promotion.PromotionCombinationCheckResponse;
import com.sba301.cinemaai.dto.promotion.PromotionCreateRequest;
import com.sba301.cinemaai.dto.promotion.PromotionResponse;
import com.sba301.cinemaai.dto.promotion.PromotionRulesResponse;
import com.sba301.cinemaai.dto.promotion.PromotionUpdateRequest;
import com.sba301.cinemaai.dto.promotion.ValidatePromotionRequest;
import com.sba301.cinemaai.dto.response.PageResponse;
import com.sba301.cinemaai.entity.Booking;
import com.sba301.cinemaai.entity.BookingPromotion;
import com.sba301.cinemaai.entity.Promotion;
import com.sba301.cinemaai.enums.PromotionStatus;
import com.sba301.cinemaai.exception.BadRequestException;
import com.sba301.cinemaai.exception.NotFoundException;
import com.sba301.cinemaai.repository.BookingPromotionRepository;
import com.sba301.cinemaai.repository.BookingRepository;
import com.sba301.cinemaai.repository.PromotionRepository;
import com.sba301.cinemaai.service.PromotionService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PromotionServiceImp implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final BookingRepository bookingRepository;
    private final BookingPromotionRepository bookingPromotionRepository;

    // ================================================================
    // Customer / Booking flow
    // ================================================================

    @Override
    @Transactional
    public ApplyPromotionResponse applyPromotion(Long bookingId, String code) {
        Booking booking = findBooking(bookingId);

        Optional<BookingPromotion> existingBp = findExistingPromotion(bookingId);
        if (existingBp.isPresent()) {
            Promotion existing = existingBp.get().getPromotion();
            Promotion incoming = promotionRepository
                    .findActiveByCode(code, LocalDateTime.now())
                    .orElseThrow(() -> new NotFoundException(
                            "Promotion not found or inactive: " + code));

            if (!canCombinePromotions(existing, incoming)) {
                throw new BadRequestException(
                        "Cannot combine promotion '" + code
                                + "' with already-applied promotion '"
                                + existing.getCode() + "'. "
                                + buildCombinationFailureReason(existing, incoming));
            }
        }

        Promotion promo = promotionRepository
                .findActiveByCode(code, LocalDateTime.now())
                .orElseThrow(() -> new NotFoundException(
                        "Promotion not found or inactive: " + code));

        validatePromotionEligibility(promo, booking.getSubtotal());

        BigDecimal discount = calculateDiscount(promo, booking.getSubtotal());
        updateBookingWithDiscount(booking, discount);

        bookingPromotionRepository.save(new BookingPromotion(booking, promo, discount));
        promo.increaseUsage();

        return ApplyPromotionResponse.builder()
                .code(promo.getCode())
                .promotionName(promo.getName())
                .originalAmount(booking.getSubtotal())
                .discountAmount(discount)
                .finalAmount(booking.getTotalAmount())
                .message("Promotion applied successfully")
                .isValid(true)
                .isPointBased(promo.isPointBased())
                .canCombineWithOtherPromos(promo.isCanCombineWithPoints())
                .build();
    }

    @Override
    @Transactional
    public void removePromotion(Long bookingId) {
        Booking booking = findBooking(bookingId);

        BookingPromotion bp = bookingPromotionRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new BadRequestException(
                        "No promotion applied to this booking"));

        bookingPromotionRepository.delete(bp);
        booking.clearPromotion();
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionResponse getByCode(String code) {
        return PromotionResponse.from(
                promotionRepository.findByCode(code)
                        .orElseThrow(() -> new NotFoundException(
                                "Promotion not found: " + code)));
    }

    @Override
    @Transactional(readOnly = true)
    public ApplyPromotionResponse validatePromotion(ValidatePromotionRequest request) {
        return validatePromotionAdvanced(request);
    }

    @Override
    @Transactional(readOnly = true)
    public ApplyPromotionResponse validatePromotionAdvanced(ValidatePromotionRequest request) {
        List<String> errors = new ArrayList<>();

        // ---- resolve promotion ----
        if (request.getCode() != null && request.getPromotionId() != null) {
            return ApplyPromotionResponse.builder()
                    .isValid(false)
                    .message("Provide either code or promotionId, not both")
                    .validationErrors(List.of(
                            "code and promotionId cannot be provided simultaneously"))
                    .build();
        }
        if (request.getCode() == null && request.getPromotionId() == null) {
            return ApplyPromotionResponse.builder()
                    .isValid(false)
                    .message("Either code or promotionId must be provided")
                    .validationErrors(List.of("No promotion identifier provided"))
                    .build();
        }

        Optional<Promotion> promoOpt;
        LocalDateTime now = LocalDateTime.now();

        if (request.getCode() != null) {
            promoOpt = promotionRepository.findActiveByCode(request.getCode(), now);
        } else {
            promoOpt = promotionRepository.findById(request.getPromotionId())
                    .filter(p -> p.getStatus() == PromotionStatus.ACTIVE
                            && !p.getStartsAt().isAfter(now)
                            && !p.getEndsAt().isBefore(now));
        }

        if (promoOpt.isEmpty()) {
            String identifier = request.getCode() != null
                    ? "code '" + request.getCode() + "'"
                    : "ID " + request.getPromotionId();
            return ApplyPromotionResponse.builder()
                    .isValid(false)
                    .message("Promotion not found or inactive: " + identifier)
                    .validationErrors(List.of("Promotion not found or inactive: " + identifier))
                    .build();
        }

        Promotion promo = promoOpt.get();

        // ---- point-based check ----
        if (promo.isPointBased()) {
            if (request.getUsePoints() == null) {
                errors.add("Promotion '" + promo.getCode()
                        + "' requires " + promo.getRequiredPoints()
                        + " points but no points were provided");
            } else if (request.getUsePoints() < promo.getRequiredPoints()) {
                errors.add("Insufficient points: required " + promo.getRequiredPoints()
                        + ", provided " + request.getUsePoints());
            }
            // TODO: Integrate with LoyaltyPointService to verify user's actual balance
        }

        // ---- common eligibility checks ----
        if (promo.getUsageLimit() != null
                && promo.getUsedCount() >= promo.getUsageLimit()) {
            errors.add("Promotion usage limit has been reached");
        }
        if (promo.getMinOrderAmount() != null
                && request.getOrderAmount().compareTo(promo.getMinOrderAmount()) < 0) {
            errors.add("Order amount " + request.getOrderAmount().toPlainString()
                    + " does not meet minimum required: "
                    + promo.getMinOrderAmount().toPlainString());
        }

        // ---- combination check ----
        if (request.getOtherPromotionId() != null) {
            Optional<Promotion> otherOpt = promotionRepository.findById(
                    request.getOtherPromotionId());
            if (otherOpt.isPresent()) {
                Promotion other = otherOpt.get();
                if (!canCombinePromotions(promo, other)) {
                    errors.add("Cannot combine with promotion '"
                            + other.getCode() + "': "
                            + buildCombinationFailureReason(promo, other));
                }
            } else {
                errors.add("Other promotion ID " + request.getOtherPromotionId()
                        + " not found");
            }
        }

        if (!errors.isEmpty()) {
            return ApplyPromotionResponse.builder()
                    .code(promo.getCode())
                    .promotionName(promo.getName())
                    .originalAmount(request.getOrderAmount())
                    .isValid(false)
                    .message("Promotion validation failed")
                    .isPointBased(promo.isPointBased())
                    .requiredPoints(promo.getRequiredPoints())
                    .canCombineWithOtherPromos(promo.isCanCombineWithPoints())
                    .validationErrors(errors)
                    .build();
        }

        BigDecimal discount = calculateDiscount(promo, request.getOrderAmount());
        BigDecimal finalAmount = request.getOrderAmount().subtract(discount);

        return ApplyPromotionResponse.builder()
                .code(promo.getCode())
                .promotionName(promo.getName())
                .originalAmount(request.getOrderAmount())
                .discountAmount(discount)
                .finalAmount(finalAmount)
                .message("Promotion is valid")
                .isValid(true)
                .isPointBased(promo.isPointBased())
                .requiredPoints(promo.getRequiredPoints())
                .canCombineWithOtherPromos(promo.isCanCombineWithPoints())
                .build();
    }

    @Override
    @Transactional
    public ApplyPromotionResponse applyPointBasedPromotion(Long bookingId, Long promotionId,
                                                            Integer pointsToUse) {
        Booking booking = findBooking(bookingId);
        Promotion promo = findPromotion(promotionId);

        if (!promo.isPointBased()) {
            throw new BadRequestException(
                    "Promotion " + promo.getCode() + " is not a point-based promotion");
        }
        if (promo.getStatus() != PromotionStatus.ACTIVE) {
            throw new BadRequestException(
                    "Promotion " + promo.getCode() + " is not active");
        }

        LocalDateTime now = LocalDateTime.now();
        if (promo.getStartsAt().isAfter(now) || promo.getEndsAt().isBefore(now)) {
            throw new BadRequestException(
                    "Promotion " + promo.getCode() + " is outside its validity period");
        }

        if (pointsToUse == null || pointsToUse < promo.getRequiredPoints()) {
            throw new BadRequestException(
                    "Insufficient points: required " + promo.getRequiredPoints()
                            + ", provided " + pointsToUse);
        }

        // TODO: Integrate with LoyaltyPointService to verify and deduct points from user balance

        validatePromotionEligibility(promo, booking.getSubtotal());

        BigDecimal discount = calculateDiscount(promo, booking.getSubtotal());
        updateBookingWithDiscount(booking, discount);

        bookingPromotionRepository.save(new BookingPromotion(booking, promo, discount));
        promo.increaseUsage();

        return ApplyPromotionResponse.builder()
                .code(promo.getCode())
                .promotionName(promo.getName())
                .originalAmount(booking.getSubtotal())
                .discountAmount(discount)
                .finalAmount(booking.getTotalAmount())
                .message("Point-based promotion applied successfully")
                .isValid(true)
                .isPointBased(true)
                .requiredPoints(promo.getRequiredPoints())
                .canCombineWithOtherPromos(promo.isCanCombineWithPoints())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionCombinationCheckResponse checkCombination(Long promoId1, Long promoId2) {
        Promotion p1 = findPromotion(promoId1);
        Promotion p2 = findPromotion(promoId2);

        boolean canCombine = canCombinePromotions(p1, p2);
        String reason = canCombine ? "Both promotions allow combination"
                : buildCombinationFailureReason(p1, p2);

        return PromotionCombinationCheckResponse.builder()
                .promotionId1(promoId1)
                .promotionId2(promoId2)
                .canCombine(canCombine)
                .reason(reason)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionCombinationCheckResponse checkCombinationWithPoints(Long promotionId,
                                                                         Integer pointsToUse) {
        Promotion promo = findPromotion(promotionId);

        boolean canCombine = promo.isCanCombineWithPoints();
        String reason = canCombine
                ? "Promotion '" + promo.getCode() + "' can be combined with loyalty points"
                : "Promotion '" + promo.getCode()
                + "' does not allow combination with loyalty points";

        return PromotionCombinationCheckResponse.builder()
                .promotionId1(promotionId)
                .promotionId2(null)
                .canCombine(canCombine)
                .reason(reason)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionResponse> getAvailablePromotions() {
        return promotionRepository.findAllActive(LocalDateTime.now())
                .stream()
                .map(PromotionResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionResponse> getPointBasedPromotions() {
        return promotionRepository.findByRequiredPointsNotNull(PromotionStatus.ACTIVE)
                .stream()
                .map(PromotionResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionRulesResponse getPromotionRules(Long promotionId) {
        Promotion promo = findPromotion(promotionId);

        return PromotionRulesResponse.builder()
                .promotionId(promo.getId())
                .code(promo.getCode())
                .name(promo.getName())
                .description(promo.getDescription())
                .isPointBased(promo.isPointBased())
                .requiredPoints(promo.getRequiredPoints())
                .minOrderAmount(promo.getMinOrderAmount())
                .maxDiscountAmount(promo.getMaxDiscountAmount())
                .usageLimit(promo.getUsageLimit())
                .usedCount(promo.getUsedCount())
                .startsAt(promo.getStartsAt())
                .endsAt(promo.getEndsAt())
                .canCombineWithOtherPromos(promo.isCanCombineWithPoints())
                .build();
    }

    // ================================================================
    // Admin CRUD
    // ================================================================

    @Override
    @Transactional
    public PromotionResponse create(PromotionCreateRequest request) {
        if (promotionRepository.existsByCode(request.getCode())) {
            throw new BadRequestException(
                    "Promotion code already exists: " + request.getCode());
        }
        if (request.getStartsAt().isAfter(request.getEndsAt())) {
            throw new BadRequestException("Start time must be before end time");
        }
        if (request.getRequiredPoints() != null && request.getRequiredPoints() <= 0) {
            throw new BadRequestException("Required points must be positive");
        }

        Promotion promo = new Promotion(
                request.getCode().toUpperCase(),
                request.getName(),
                request.getType(),
                request.getValue(),
                request.getStartsAt(),
                request.getEndsAt()
        );
        promo.updateMinOrder(request.getMinOrderAmount());
        promo.updateMaxDiscount(request.getMaxDiscountAmount());
        promo.updateUsageLimit(request.getUsageLimit());
        promo.updateCanCombineWithPoints(request.isCanCombineWithPoints());
        promo.updateRequiredPoints(request.getRequiredPoints());
        promo.updateDescription(request.getDescription());

        return PromotionResponse.from(promotionRepository.save(promo));
    }

    @Override
    @Transactional
    public PromotionResponse createPointRedemptionPromotion(PromotionCreateRequest request) {
        if (request.getRequiredPoints() == null || request.getRequiredPoints() <= 0) {
            throw new BadRequestException(
                    "Point-redemption promotion must specify a positive requiredPoints value");
        }
        return create(request);
    }

    @Override
    @Transactional
    public PromotionResponse update(Long id, PromotionUpdateRequest request) {
        Promotion promo = findPromotion(id);

        if (request.getName() != null) {
            promo.updateName(request.getName());
        }
        if (request.getType() != null) {
            promo.updateType(request.getType());
        }
        if (request.getValue() != null) {
            promo.updateValue(request.getValue());
        }
        if (request.getMinOrderAmount() != null) {
            promo.updateMinOrder(request.getMinOrderAmount());
        }
        if (request.getMaxDiscountAmount() != null) {
            promo.updateMaxDiscount(request.getMaxDiscountAmount());
        }
        if (request.getUsageLimit() != null) {
            promo.updateUsageLimit(request.getUsageLimit());
        }
        if (request.getStartsAt() != null && request.getEndsAt() != null) {
            if (request.getStartsAt().isAfter(request.getEndsAt())) {
                throw new BadRequestException("Start time must be before end time");
            }
            promo.updateDates(request.getStartsAt(), request.getEndsAt());
        } else if (request.getStartsAt() != null) {
            promo.updateDates(request.getStartsAt(), promo.getEndsAt());
        } else if (request.getEndsAt() != null) {
            promo.updateDates(promo.getStartsAt(), request.getEndsAt());
        }
        if (request.getStatus() != null) {
            promo.changeStatus(request.getStatus());
        }
        if (request.getCanCombineWithPoints() != null) {
            promo.updateCanCombineWithPoints(request.getCanCombineWithPoints());
        }
        if (request.getRequiredPoints() != null) {
            promo.updateRequiredPoints(request.getRequiredPoints());
        }
        if (request.getDescription() != null) {
            promo.updateDescription(request.getDescription());
        }

        return PromotionResponse.from(promotionRepository.save(promo));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!promotionRepository.existsById(id)) {
            throw new NotFoundException("Promotion not found: " + id);
        }
        promotionRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PromotionResponse> listAll(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(
                promotionRepository.findAll(pageable).map(PromotionResponse::from));
    }

    // ================================================================
    // Private helpers
    // ================================================================

    private boolean canCombinePromotions(Promotion p1, Promotion p2) {
        return p1.isCanCombineWithPoints() && p2.isCanCombineWithPoints();
    }

    private String buildCombinationFailureReason(Promotion p1, Promotion p2) {
        if (!p1.isCanCombineWithPoints() && !p2.isCanCombineWithPoints()) {
            return "Neither '" + p1.getCode() + "' nor '" + p2.getCode()
                    + "' allows combination";
        }
        if (!p1.isCanCombineWithPoints()) {
            return "Promotion '" + p1.getCode() + "' does not allow combination";
        }
        return "Promotion '" + p2.getCode() + "' does not allow combination";
    }

    private void validatePromotionEligibility(Promotion promo, BigDecimal orderAmount) {
        LocalDateTime now = LocalDateTime.now();
        if (promo.getStartsAt().isAfter(now) || promo.getEndsAt().isBefore(now)) {
            throw new BadRequestException(
                    "Promotion '" + promo.getCode() + "' is outside its validity period");
        }
        if (promo.getStatus() != PromotionStatus.ACTIVE) {
            throw new BadRequestException(
                    "Promotion '" + promo.getCode() + "' is not active");
        }
        if (promo.getUsageLimit() != null
                && promo.getUsedCount() >= promo.getUsageLimit()) {
            throw new BadRequestException("Promotion usage limit has been reached");
        }
        if (promo.getMinOrderAmount() != null
                && orderAmount.compareTo(promo.getMinOrderAmount()) < 0) {
            throw new BadRequestException(
                    "Order amount does not meet minimum required: "
                            + promo.getMinOrderAmount().toPlainString());
        }
    }

    private void updateBookingWithDiscount(Booking booking, BigDecimal discount) {
        booking.updateAmounts(
                booking.getSubtotal(),
                discount,
                booking.getSubtotal().subtract(discount));
    }

    private BigDecimal calculateDiscount(Promotion promo, BigDecimal subtotal) {
        BigDecimal discount = promo.getType().calculate(subtotal, promo.getValue());
        if (promo.getMaxDiscountAmount() != null) {
            discount = discount.min(promo.getMaxDiscountAmount());
        }
        return discount.min(subtotal);
    }

    private Booking findBooking(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Booking not found: " + id));
    }

    private Promotion findPromotion(Long id) {
        return promotionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Promotion not found: " + id));
    }

    private Optional<BookingPromotion> findExistingPromotion(Long bookingId) {
        return bookingPromotionRepository.findByBookingId(bookingId);
    }
}
