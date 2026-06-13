package com.sba301.cinemaai.dto.request.review;

import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class HideReviewRequest {

    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;
}
