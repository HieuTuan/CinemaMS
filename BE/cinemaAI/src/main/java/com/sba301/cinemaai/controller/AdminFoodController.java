package com.sba301.cinemaai.controller;

import com.sba301.cinemaai.dto.food.FoodComboRequest;
import com.sba301.cinemaai.dto.food.FoodComboResponse;
import com.sba301.cinemaai.dto.food.FoodItemRequest;
import com.sba301.cinemaai.dto.food.FoodItemResponse;
import com.sba301.cinemaai.dto.response.ApiResponse;
import com.sba301.cinemaai.service.FoodService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/foods")
@RequiredArgsConstructor
public class AdminFoodController {

    private final FoodService foodService;

    @GetMapping("/items")
    public ApiResponse<List<FoodItemResponse>> getItems() {
        return ApiResponse.success(foodService.getAllItems());
    }

    @GetMapping("/combos")
    public ApiResponse<List<FoodComboResponse>> getCombos() {
        return ApiResponse.success(foodService.getAllCombos());
    }

    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FoodItemResponse> createItem(@Valid @RequestBody FoodItemRequest request) {
        return ApiResponse.success(foodService.createItem(request), "Food item created successfully");
    }

    @PostMapping("/combos")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FoodComboResponse> createCombo(@Valid @RequestBody FoodComboRequest request) {
        return ApiResponse.success(foodService.createCombo(request), "Food combo created successfully");
    }

    @PutMapping("/items/{itemId}")
    public ApiResponse<FoodItemResponse> updateItem(
            @PathVariable Long itemId,
            @Valid @RequestBody FoodItemRequest request
    ) {
        return ApiResponse.success(foodService.updateItem(itemId, request), "Food item updated successfully");
    }

    @PutMapping("/combos/{comboId}")
    public ApiResponse<FoodComboResponse> updateCombo(
            @PathVariable Long comboId,
            @Valid @RequestBody FoodComboRequest request
    ) {
        return ApiResponse.success(foodService.updateCombo(comboId, request), "Food combo updated successfully");
    }

    @DeleteMapping("/items/{itemId}")
    public ApiResponse<FoodItemResponse> deleteItem(@PathVariable Long itemId) {
        return ApiResponse.success(foodService.deleteItem(itemId), "Food item deleted successfully");
    }

    @DeleteMapping("/combos/{comboId}")
    public ApiResponse<FoodComboResponse> deleteCombo(@PathVariable Long comboId) {
        return ApiResponse.success(foodService.deleteCombo(comboId), "Food combo deleted successfully");
    }
}
