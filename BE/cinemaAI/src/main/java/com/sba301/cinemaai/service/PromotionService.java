package com.sba301.cinemaai.service;

import com.sba301.cinemaai.dto.promotion.ApplyPromotionResponse;
import com.sba301.cinemaai.dto.promotion.PromotionCombinationCheckRequest;
import com.sba301.cinemaai.dto.promotion.PromotionCombinationCheckResponse;
import com.sba301.cinemaai.dto.promotion.PromotionCreateRequest;
import com.sba301.cinemaai.dto.promotion.PromotionResponse;
import com.sba301.cinemaai.dto.promotion.PromotionRulesResponse;
import com.sba301.cinemaai.dto.promotion.PromotionUpdateRequest;
import com.sba301.cinemaai.dto.promotion.ValidatePromotionRequest;
import com.sba301.cinemaai.dto.response.PageResponse;
import java.util.List;

public interface PromotionService {

    // ---- Customer / Booking flow ----

    ApplyPromotionResponse applyPromotion(Long bookingId, String code);

    void removePromotion(Long bookingId);

    PromotionResponse getByCode(String code);

    /** Legacy single-step validate — delegates to validatePromotionAdvanced. */
    ApplyPromotionResponse validatePromotion(ValidatePromotionRequest request);

    /**
     * Advanced validate: supports code-based AND point-based promotions,
     * collects all validation errors instead of throwing on first failure,
     * and optionally checks combination compatibility with a second promotion.
     */
    ApplyPromotionResponse validatePromotionAdvanced(ValidatePromotionRequest request);

    /**
     * Apply a point-based promotion to a booking.
     * Verifies the promotion requires points, checks usage limits,
     * and records the BookingPromotion entry.
     * NOTE: LoyaltyPointService balance check is a future integration.
     */
    ApplyPromotionResponse applyPointBasedPromotion(Long bookingId, Long promotionId,
                                                    Integer pointsToUse);

    /**
     * Check whether two promotions can be combined (stacked) on the same booking.
     * Returns detailed reason when combination is not allowed.
     */
    PromotionCombinationCheckResponse checkCombination(Long promoId1, Long promoId2);

    /**
     * Check whether a promotion can be combined with a loyalty-point redemption.
     */
    PromotionCombinationCheckResponse checkCombinationWithPoints(Long promotionId,
                                                                  Integer pointsToUse);

    /** Returns all currently active (ACTIVE + within date range) promotions. */
    List<PromotionResponse> getAvailablePromotions();

    /** Returns all ACTIVE point-based promotions (requiredPoints IS NOT NULL). */
    List<PromotionResponse> getPointBasedPromotions();

    /**
     * Returns the full rule-set of a promotion: limits, dates, combination flags, etc.
     */
    PromotionRulesResponse getPromotionRules(Long promotionId);

    // ---- Admin CRUD ----

    PromotionResponse create(PromotionCreateRequest request);

    /**
     * Convenience method for creating a point-redemption promotion.
     * Validates that requiredPoints is not null before delegating to create().
     */
    PromotionResponse createPointRedemptionPromotion(PromotionCreateRequest request);

    PromotionResponse update(Long id, PromotionUpdateRequest request);

    void delete(Long id);

    PageResponse<PromotionResponse> listAll(int page, int size);
}
