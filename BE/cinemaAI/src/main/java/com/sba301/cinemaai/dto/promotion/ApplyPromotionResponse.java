package com.sba301.cinemaai.dto.promotion;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ApplyPromotionResponse {

    private String code;
    private String promotionName;
    private BigDecimal originalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String message;

    @Builder.Default
    private boolean isValid = true;

    private boolean isPointBased;
    private Integer requiredPoints;
    private boolean canCombineWithOtherPromos;

    @Builder.Default
    private List<String> validationErrors = new ArrayList<>();
}
