package com.sba301.cinemaai.dto.response.promotion;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PromotionCombinationCheckResponse {

    private Long promotionId1;
    private Long promotionId2;
    private boolean canCombine;
    private String reason;
    private BigDecimal combinedDiscount;
}
