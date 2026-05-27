package com.sba301.cinemaai.service;

import com.sba301.cinemaai.dto.promotion.ApplyPromotionResponse;
import com.sba301.cinemaai.dto.promotion.PromotionResponse;

public interface PromotionService {

    ApplyPromotionResponse applyPromotion(Long bookingId, String code);

    void removePromotion(Long bookingId);

    PromotionResponse getByCode(String code);
}