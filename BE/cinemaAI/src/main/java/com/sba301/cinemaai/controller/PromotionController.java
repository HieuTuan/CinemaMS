package com.sba301.cinemaai.controller;

import com.sba301.cinemaai.dto.promotion.ApplyPromotionResponse;
import com.sba301.cinemaai.dto.promotion.PromotionCombinationCheckRequest;
import com.sba301.cinemaai.dto.promotion.PromotionCombinationCheckResponse;
import com.sba301.cinemaai.dto.promotion.PromotionResponse;
import com.sba301.cinemaai.dto.promotion.ValidatePromotionRequest;
import com.sba301.cinemaai.dto.response.ApiResponse;
import com.sba301.cinemaai.service.PromotionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/promotions")
@RequiredArgsConstructor
@Tag(name = "Promotion", description = "Endpoints for applying and managing promotions on bookings")
public class PromotionController {

    private final PromotionService promotionService;

    @GetMapping("/{code}")
    @Operation(summary = "Get promotion by code",
               description = "Returns promotion details if the code exists")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200",
                    description = "Promotion found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404",
                    description = "Promotion not found")
    })
    public ResponseEntity<ApiResponse<PromotionResponse>> getByCode(
            @Parameter(description = "Promotion code", example = "SUMMER2024")
            @PathVariable String code
    ) {
        return ResponseEntity.ok(ApiResponse.success(promotionService.getByCode(code)));
    }

    @PostMapping("/apply")
    @Operation(summary = "Apply promotion to a booking",
               description = "Validates and applies a code-based promotion to the specified booking")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200",
                    description = "Promotion applied successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400",
                    description = "Invalid promotion or booking condition not met"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404",
                    description = "Booking or promotion not found")
    })
    public ResponseEntity<ApiResponse<ApplyPromotionResponse>> applyPromotion(
            @Parameter(description = "Booking ID", example = "1")
            @RequestParam Long bookingId,
            @Parameter(description = "Promotion code to apply", example = "SUMMER2024")
            @RequestParam String code
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                promotionService.applyPromotion(bookingId, code)));
    }

    @PostMapping("/apply-points")
    @Operation(summary = "Apply point-based promotion to a booking",
               description = "Applies a promotion that requires loyalty points")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200",
                    description = "Point-based promotion applied"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400",
                    description = "Promotion is not point-based or insufficient points"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404",
                    description = "Booking or promotion not found")
    })
    public ResponseEntity<ApiResponse<ApplyPromotionResponse>> applyPointBasedPromotion(
            @Parameter(description = "Booking ID") @RequestParam Long bookingId,
            @Parameter(description = "Promotion ID") @RequestParam Long promotionId,
            @Parameter(description = "Loyalty points to use") @RequestParam Integer pointsToUse
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                promotionService.applyPointBasedPromotion(bookingId, promotionId, pointsToUse)));
    }

    @DeleteMapping("/remove")
    @Operation(summary = "Remove promotion from a booking",
               description = "Removes the applied promotion and recalculates booking total")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200",
                    description = "Promotion removed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400",
                    description = "No promotion applied to this booking"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404",
                    description = "Booking not found")
    })
    public ResponseEntity<ApiResponse<Void>> removePromotion(
            @Parameter(description = "Booking ID") @RequestParam Long bookingId
    ) {
        promotionService.removePromotion(bookingId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/validate")
    @Operation(summary = "Validate / preview promotion (legacy)",
               description = "Delegates to validate-advanced. Kept for backward compatibility.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200",
                    description = "Validation result returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404",
                    description = "Promotion not found or inactive")
    })
    public ResponseEntity<ApiResponse<ApplyPromotionResponse>> validate(
            @Valid @RequestBody ValidatePromotionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                promotionService.validatePromotion(request)));
    }

    @PostMapping("/validate-advanced")
    @Operation(summary = "Advanced promotion validation",
               description = "Supports code-based and point-based promotions. "
                       + "Collects all validation errors and optionally checks combination rules.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200",
                    description = "Validation result returned (isValid indicates pass/fail)")
    })
    public ResponseEntity<ApiResponse<ApplyPromotionResponse>> validateAdvanced(
            @Valid @RequestBody ValidatePromotionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                promotionService.validatePromotionAdvanced(request)));
    }

    @GetMapping("/available")
    @Operation(summary = "Get all available promotions",
               description = "Returns promotions that are currently ACTIVE and within their date range")
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> getAvailable() {
        return ResponseEntity.ok(ApiResponse.success(
                promotionService.getAvailablePromotions()));
    }

    @GetMapping("/point-based")
    @Operation(summary = "Get point-based promotions",
               description = "Returns all active promotions that require loyalty points to redeem")
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> getPointBased() {
        return ResponseEntity.ok(ApiResponse.success(
                promotionService.getPointBasedPromotions()));
    }

    @PostMapping("/check-combination")
    @Operation(summary = "Check if two promotions can be combined",
               description = "Returns whether two promotions can be stacked on the same booking")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200",
                    description = "Combination check result returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404",
                    description = "One or both promotions not found")
    })
    public ResponseEntity<ApiResponse<PromotionCombinationCheckResponse>> checkCombination(
            @Valid @RequestBody PromotionCombinationCheckRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                promotionService.checkCombination(
                        request.getPromotionId1(), request.getPromotionId2())));
    }
}
