package com.sba301.cinemaai.dto.promotion;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import lombok.Getter;

@Getter
public class ValidatePromotionRequest {

    /**
     * Code-based promotion code. Either this or promotionId must be provided,
     * but not both at the same time.
     */
    private String code;

    @NotNull(message = "Order amount is required")
    @Positive(message = "Order amount must be positive")
    private BigDecimal orderAmount;

    /**
     * Number of loyalty points the customer wants to use (for point-based promotions).
     */
    @Positive(message = "Points to use must be positive")
    private Integer usePoints;

    /**
     * ID of a point-based promotion. Either this or code must be provided.
     */
    @Positive(message = "Promotion ID must be positive")
    private Long promotionId;

    /**
     * ID of a second promotion to check combination compatibility.
     */
    private Long otherPromotionId;
}
