package com.sba301.cinemaai.controller;

import com.sba301.cinemaai.dto.cinema.CinemaRequest;
import com.sba301.cinemaai.dto.cinema.CinemaResponse;
import com.sba301.cinemaai.dto.response.ApiResponse;
import com.sba301.cinemaai.enums.CinemaStatus;
import com.sba301.cinemaai.service.CinemaService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/cinemas")
@RequiredArgsConstructor
public class AdminCinemaController {

    private final CinemaService cinemaService;

    @GetMapping
    public ApiResponse<List<CinemaResponse>> getCinemas() {
        return ApiResponse.success(cinemaService.getAdminCinemas());
    }

    @GetMapping("/{cinemaId}")
    public ApiResponse<CinemaResponse> getCinema(@PathVariable Long cinemaId) {
        return ApiResponse.success(cinemaService.getCinema(cinemaId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CinemaResponse> createCinema(@Valid @RequestBody CinemaRequest request) {
        return ApiResponse.success(cinemaService.create(request), "Cinema created successfully");
    }

    @PutMapping("/{cinemaId}")
    public ApiResponse<CinemaResponse> updateCinema(
            @PathVariable Long cinemaId,
            @Valid @RequestBody CinemaRequest request
    ) {
        return ApiResponse.success(cinemaService.update(cinemaId, request), "Cinema updated successfully");
    }

    @PatchMapping("/{cinemaId}/status")
    public ApiResponse<CinemaResponse> updateStatus(
            @PathVariable Long cinemaId,
            @RequestParam CinemaStatus status
    ) {
        return ApiResponse.success(cinemaService.updateStatus(cinemaId, status), "Cinema status updated successfully");
    }

    @DeleteMapping("/{cinemaId}")
    public ApiResponse<Void> deleteCinema(@PathVariable Long cinemaId) {
        cinemaService.delete(cinemaId);
        return ApiResponse.success(null, "Cinema deleted successfully");
    }
}
