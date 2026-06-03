package com.sba301.cinemaai.dto.promotion;

import com.sba301.cinemaai.enums.PromotionStatus;
import com.sba301.cinemaai.enums.PromotionType;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;

@Getter
public class PromotionUpdateRequest {

    private String name;

    private PromotionType type;

    @Positive(message = "Value must be positive")
    private BigDecimal value;

    @Positive(message = "Min order amount must be positive")
    private BigDecimal minOrderAmount;

    @Positive(message = "Max discount amount must be positive")
    private BigDecimal maxDiscountAmount;

    @Positive(message = "Usage limit must be positive")
    private Integer usageLimit;

    private LocalDateTime startsAt;

    private LocalDateTime endsAt;

    private PromotionStatus status;

    private Boolean canCombineWithPoints;

    @Positive(message = "Required points must be positive")
    private Integer requiredPoints;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
}
