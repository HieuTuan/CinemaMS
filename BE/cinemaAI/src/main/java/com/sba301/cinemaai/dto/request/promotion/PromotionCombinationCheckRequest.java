package com.sba301.cinemaai.dto.request.promotion;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PromotionCombinationCheckRequest {

    @NotNull(message = "First promotion ID is required")
    @Positive(message = "First promotion ID must be positive")
    private Long promotionId1;

    @NotNull(message = "Second promotion ID is required")
    @Positive(message = "Second promotion ID must be positive")
    private Long promotionId2;

    @Positive(message = "Points to use must be positive")
    private Integer usePoints;
}
