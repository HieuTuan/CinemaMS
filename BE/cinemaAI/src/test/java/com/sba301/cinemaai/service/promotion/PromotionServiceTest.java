package com.sba301.cinemaai.service.promotion;

import com.sba301.cinemaai.dto.promotion.ApplyPromotionResponse;
import com.sba301.cinemaai.dto.promotion.PromotionCombinationCheckResponse;
import com.sba301.cinemaai.dto.promotion.PromotionCreateRequest;
import com.sba301.cinemaai.dto.promotion.PromotionResponse;
import com.sba301.cinemaai.dto.promotion.PromotionRulesResponse;
import com.sba301.cinemaai.dto.promotion.ValidatePromotionRequest;
import com.sba301.cinemaai.entity.Booking;
import com.sba301.cinemaai.entity.BookingPromotion;
import com.sba301.cinemaai.entity.Promotion;
import com.sba301.cinemaai.entity.Showtime;
import com.sba301.cinemaai.entity.User;
import com.sba301.cinemaai.enums.PromotionStatus;
import com.sba301.cinemaai.enums.PromotionType;
import com.sba301.cinemaai.enums.UserStatus;
import com.sba301.cinemaai.exception.BadRequestException;
import com.sba301.cinemaai.exception.NotFoundException;
import com.sba301.cinemaai.repository.BookingPromotionRepository;
import com.sba301.cinemaai.repository.BookingRepository;
import com.sba301.cinemaai.repository.PromotionRepository;
import com.sba301.cinemaai.service.imp.PromotionServiceImp;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PromotionServiceTest {

    @Mock
    private PromotionRepository promotionRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BookingPromotionRepository bookingPromotionRepository;

    @InjectMocks
    private PromotionServiceImp promotionService;

    private Promotion activePromo;
    private Promotion pointBasedPromo;
    private Promotion noComboPromo;

    @BeforeEach
    void setUp() throws Exception {
        activePromo = buildPromo("SAVE10", PromotionType.PERCENTAGE, new BigDecimal("10"),
                LocalDateTime.now().minusDays(1), LocalDateTime.now().plusDays(10),
                null, true);

        pointBasedPromo = buildPromo("POINTS500", PromotionType.FIXED_AMOUNT, new BigDecimal("50000"),
                LocalDateTime.now().minusDays(1), LocalDateTime.now().plusDays(10),
                500, true);

        noComboPromo = buildPromo("NOCOMBO", PromotionType.FIXED_AMOUNT, new BigDecimal("30000"),
                LocalDateTime.now().minusDays(1), LocalDateTime.now().plusDays(10),
                null, false);
    }

    // ================================================================
    // validatePromotionAdvanced
    // ================================================================

    @Test
    @DisplayName("validatePromotionAdvanced — valid code returns isValid=true with discount")
    void validatePromotionAdvanced_withValidCode_shouldReturnValid() {
        ValidatePromotionRequest req = buildValidateRequest("SAVE10", null,
                new BigDecimal("200000"), null, null);

        when(promotionRepository.findActiveByCode(eq("SAVE10"), any()))
                .thenReturn(Optional.of(activePromo));

        ApplyPromotionResponse result = promotionService.validatePromotionAdvanced(req);

        assertThat(result.isValid()).isTrue();
        assertThat(result.getValidationErrors()).isEmpty();
        assertThat(result.getDiscountAmount()).isEqualByComparingTo(new BigDecimal("20000.00"));
    }

    @Test
    @DisplayName("validatePromotionAdvanced — expired / inactive promo returns isValid=false")
    void validatePromotionAdvanced_withExpiredPromo_shouldReturnInvalid() {
        ValidatePromotionRequest req = buildValidateRequest("OLD20", null,
                new BigDecimal("100000"), null, null);

        when(promotionRepository.findActiveByCode(eq("OLD20"), any()))
                .thenReturn(Optional.empty());

        ApplyPromotionResponse result = promotionService.validatePromotionAdvanced(req);

        assertThat(result.isValid()).isFalse();
        assertThat(result.getValidationErrors()).isNotEmpty();
    }

    @Test
    @DisplayName("validatePromotionAdvanced — point-based promo with insufficient points returns isValid=false")
    void validatePromotionAdvanced_withPointBased_insufficientPoints_shouldReturnInvalid() {
        ValidatePromotionRequest req = buildValidateRequest(null, setId(pointBasedPromo, 2L).getId(),
                new BigDecimal("200000"), 100, null);

        when(promotionRepository.findById(2L)).thenReturn(Optional.of(pointBasedPromo));

        ApplyPromotionResponse result = promotionService.validatePromotionAdvanced(req);

        assertThat(result.isValid()).isFalse();
        assertThat(result.getValidationErrors())
                .anyMatch(e -> e.contains("Insufficient points"));
    }

    @Test
    @DisplayName("validatePromotionAdvanced — point-based promo with enough points returns isValid=true")
    void validatePromotionAdvanced_withPointBased_sufficientPoints_shouldReturnValid() {
        ValidatePromotionRequest req = buildValidateRequest(null, setId(pointBasedPromo, 2L).getId(),
                new BigDecimal("200000"), 600, null);

        when(promotionRepository.findById(2L)).thenReturn(Optional.of(pointBasedPromo));

        ApplyPromotionResponse result = promotionService.validatePromotionAdvanced(req);

        assertThat(result.isValid()).isTrue();
        assertThat(result.isPointBased()).isTrue();
    }

    @Test
    @DisplayName("validatePromotionAdvanced — both code and promotionId provided returns isValid=false")
    void validatePromotionAdvanced_bothCodeAndId_shouldReturnInvalid() {
        ValidatePromotionRequest req = buildValidateRequest("SAVE10", 1L,
                new BigDecimal("100000"), null, null);

        ApplyPromotionResponse result = promotionService.validatePromotionAdvanced(req);

        assertThat(result.isValid()).isFalse();
        assertThat(result.getValidationErrors())
                .anyMatch(e -> e.contains("simultaneously"));
    }

    @Test
    @DisplayName("validatePromotionAdvanced — neither code nor promotionId returns isValid=false")
    void validatePromotionAdvanced_noIdentifier_shouldReturnInvalid() {
        ValidatePromotionRequest req = buildValidateRequest(null, null,
                new BigDecimal("100000"), null, null);

        ApplyPromotionResponse result = promotionService.validatePromotionAdvanced(req);

        assertThat(result.isValid()).isFalse();
    }

    // ================================================================
    // checkCombination
    // ================================================================

    @Test
    @DisplayName("checkCombination — both can combine returns canCombine=true")
    void checkCombination_bothCanCombine_shouldReturnTrue() {
        setId(activePromo, 1L);
        setId(pointBasedPromo, 2L);

        when(promotionRepository.findById(1L)).thenReturn(Optional.of(activePromo));
        when(promotionRepository.findById(2L)).thenReturn(Optional.of(pointBasedPromo));

        PromotionCombinationCheckResponse result =
                promotionService.checkCombination(1L, 2L);

        assertThat(result.isCanCombine()).isTrue();
    }

    @Test
    @DisplayName("checkCombination — one cannot combine returns canCombine=false")
    void checkCombination_oneCannot_shouldReturnFalse() {
        setId(activePromo, 1L);
        setId(noComboPromo, 3L);

        when(promotionRepository.findById(1L)).thenReturn(Optional.of(activePromo));
        when(promotionRepository.findById(3L)).thenReturn(Optional.of(noComboPromo));

        PromotionCombinationCheckResponse result =
                promotionService.checkCombination(1L, 3L);

        assertThat(result.isCanCombine()).isFalse();
        assertThat(result.getReason()).contains("NOCOMBO");
    }

    @Test
    @DisplayName("checkCombination — promotion not found throws NotFoundException")
    void checkCombination_promoNotFound_shouldThrow() {
        when(promotionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> promotionService.checkCombination(99L, 1L))
                .isInstanceOf(NotFoundException.class);
    }

    // ================================================================
    // applyPointBasedPromotion
    // ================================================================

    @Test
    @DisplayName("applyPointBasedPromotion — success with enough points")
    void applyPointBasedPromotion_success() throws Exception {
        setId(pointBasedPromo, 2L);
        Booking booking = buildBooking(new BigDecimal("300000"));

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(promotionRepository.findById(2L)).thenReturn(Optional.of(pointBasedPromo));
        when(bookingPromotionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ApplyPromotionResponse result =
                promotionService.applyPointBasedPromotion(1L, 2L, 500);

        assertThat(result.isValid()).isTrue();
        assertThat(result.isPointBased()).isTrue();
        assertThat(result.getDiscountAmount())
                .isEqualByComparingTo(new BigDecimal("50000"));
    }

    @Test
    @DisplayName("applyPointBasedPromotion — non-point-based promo throws BadRequestException")
    void applyPointBasedPromotion_notPointBased_shouldThrow() throws Exception {
        setId(activePromo, 1L);
        Booking booking = buildBooking(new BigDecimal("200000"));

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(activePromo));

        assertThatThrownBy(() -> promotionService.applyPointBasedPromotion(1L, 1L, 500))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("not a point-based promotion");
    }

    // ================================================================
    // getAvailablePromotions
    // ================================================================

    @Test
    @DisplayName("getAvailablePromotions — returns only active within date range")
    void getAvailablePromotions_shouldReturnActiveOnly() {
        when(promotionRepository.findAllActive(any()))
                .thenReturn(List.of(activePromo, pointBasedPromo));

        List<PromotionResponse> result = promotionService.getAvailablePromotions();

        assertThat(result).hasSize(2);
        verify(promotionRepository).findAllActive(any());
    }

    // ================================================================
    // getPointBasedPromotions
    // ================================================================

    @Test
    @DisplayName("getPointBasedPromotions — returns only point-based promotions")
    void getPointBasedPromotions_shouldReturnPointBasedOnly() {
        when(promotionRepository.findByRequiredPointsNotNull(PromotionStatus.ACTIVE))
                .thenReturn(List.of(pointBasedPromo));

        List<PromotionResponse> result = promotionService.getPointBasedPromotions();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isPointBased()).isTrue();
    }

    // ================================================================
    // getPromotionRules
    // ================================================================

    @Test
    @DisplayName("getPromotionRules — returns full rule-set for existing promotion")
    void getPromotionRules_existingPromo_shouldReturnRules() {
        setId(activePromo, 1L);
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(activePromo));

        PromotionRulesResponse rules = promotionService.getPromotionRules(1L);

        assertThat(rules.getCode()).isEqualTo("SAVE10");
        assertThat(rules.isPointBased()).isFalse();
        assertThat(rules.isCanCombineWithOtherPromos()).isTrue();
    }

    @Test
    @DisplayName("getPromotionRules — unknown id throws NotFoundException")
    void getPromotionRules_unknownId_shouldThrow() {
        when(promotionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> promotionService.getPromotionRules(999L))
                .isInstanceOf(NotFoundException.class);
    }

    // ================================================================
    // Helpers
    // ================================================================

    private Promotion buildPromo(String code, PromotionType type, BigDecimal value,
                                  LocalDateTime starts, LocalDateTime ends,
                                  Integer requiredPoints, boolean canCombine) throws Exception {
        Promotion p = new Promotion(code, code + " promo", type, value, starts, ends);
        setField(p, "status", PromotionStatus.ACTIVE);
        setField(p, "usedCount", 0);
        setField(p, "requiredPoints", requiredPoints);
        setField(p, "canCombineWithPoints", canCombine);
        return p;
    }

    private Promotion setId(Promotion p, Long id) {
        try {
            setField(p, "id", id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return p;
    }

    private Booking buildBooking(BigDecimal subtotal) throws Exception {
        Booking b = new Booking("BK001", buildUser(), buildShowtime(),
                LocalDateTime.now().plusHours(1));
        setField(b, "subtotal", subtotal);
        setField(b, "discountAmount", BigDecimal.ZERO);
        setField(b, "totalAmount", subtotal);
        return b;
    }

    private User buildUser() throws Exception {
        User u = new User("test@test.com", "hash", "Test User", "0900000000");
        return u;
    }

    private Showtime buildShowtime() {
        return null;
    }

    private ValidatePromotionRequest buildValidateRequest(String code, Long promotionId,
                                                           BigDecimal orderAmount,
                                                           Integer usePoints,
                                                           Long otherPromotionId) {
        ValidatePromotionRequest r = new ValidatePromotionRequest();
        try {
            setField(r, "code", code);
            setField(r, "promotionId", promotionId);
            setField(r, "orderAmount", orderAmount);
            setField(r, "usePoints", usePoints);
            setField(r, "otherPromotionId", otherPromotionId);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return r;
    }

    private void setField(Object target, String fieldName, Object value) throws Exception {
        Class<?> clazz = target.getClass();
        while (clazz != null) {
            try {
                Field field = clazz.getDeclaredField(fieldName);
                field.setAccessible(true);
                field.set(target, value);
                return;
            } catch (NoSuchFieldException e) {
                clazz = clazz.getSuperclass();
            }
        }
        throw new NoSuchFieldException("Field not found: " + fieldName);
    }
}
