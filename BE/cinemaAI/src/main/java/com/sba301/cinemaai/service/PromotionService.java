package com.sba301.cinemaai.service;

import com.sba301.cinemaai.dto.promotion.ApplyPromotionResponse;
import com.sba301.cinemaai.dto.promotion.PromotionCreateRequest;
import com.sba301.cinemaai.dto.promotion.PromotionResponse;
import com.sba301.cinemaai.dto.promotion.PromotionUpdateRequest;
import com.sba301.cinemaai.dto.promotion.ValidatePromotionRequest;
import com.sba301.cinemaai.dto.response.PageResponse;

public interface PromotionService {

    // ---- Customer / Booking flow ----
    ApplyPromotionResponse applyPromotion(Long bookingId, String code);

    void removePromotion(Long bookingId);

    PromotionResponse getByCode(String code);

    ApplyPromotionResponse validatePromotion(ValidatePromotionRequest request);

    // ---- Admin CRUD ----
    PromotionResponse create(PromotionCreateRequest request);

    PromotionResponse update(Long id, PromotionUpdateRequest request);

    void delete(Long id);

    PageResponse<PromotionResponse> listAll(int page, int size);
}
