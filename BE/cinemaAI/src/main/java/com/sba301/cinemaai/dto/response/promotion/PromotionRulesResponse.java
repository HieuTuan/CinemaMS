package com.sba301.cinemaai.dto.response.promotion;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PromotionRulesResponse {

    private Long promotionId;
    private String code;
    private String name;
    private String description;
    private boolean isPointBased;
    private Integer requiredPoints;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;
    private Integer usageLimit;
    private int usedCount;
    private LocalDateTime startsAt;
    private LocalDateTime endsAt;
    private boolean canCombineWithOtherPromos;
}
