package com.sba301.cinemaai.dto.analysis;

import jakarta.validation.constraints.Size;

public record AIAnalysisDecisionRequest(
        @Size(max = 500, message = "Reason must be at most 500 characters")
        String reason
) {
}
