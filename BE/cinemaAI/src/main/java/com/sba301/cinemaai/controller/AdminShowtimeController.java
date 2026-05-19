package com.sba301.cinemaai.controller;

import com.sba301.cinemaai.dto.cinema.ShowtimeRequest;
import com.sba301.cinemaai.dto.cinema.ShowtimeResponse;
import com.sba301.cinemaai.dto.response.ApiResponse;
import com.sba301.cinemaai.enums.ShowtimeStatus;
import com.sba301.cinemaai.service.ShowtimeService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
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
@RequestMapping("/api/v1/admin/showtimes")
@RequiredArgsConstructor
public class AdminShowtimeController {

    private final ShowtimeService showtimeService;

    @GetMapping
    public ApiResponse<List<ShowtimeResponse>> searchShowtimes(
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ApiResponse.success(showtimeService.searchAdmin(movieId, roomId, date));
    }

    @GetMapping("/{showtimeId}")
    public ApiResponse<ShowtimeResponse> getShowtime(@PathVariable Long showtimeId) {
        return ApiResponse.success(showtimeService.get(showtimeId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ShowtimeResponse> createShowtime(@Valid @RequestBody ShowtimeRequest request) {
        return ApiResponse.success(showtimeService.create(request), "Showtime created successfully");
    }

    @PutMapping("/{showtimeId}")
    public ApiResponse<ShowtimeResponse> updateShowtime(
            @PathVariable Long showtimeId,
            @Valid @RequestBody ShowtimeRequest request
    ) {
        return ApiResponse.success(showtimeService.update(showtimeId, request), "Showtime updated successfully");
    }

    @PatchMapping("/{showtimeId}/status")
    public ApiResponse<ShowtimeResponse> updateStatus(
            @PathVariable Long showtimeId,
            @RequestParam ShowtimeStatus status
    ) {
        return ApiResponse.success(showtimeService.updateStatus(showtimeId, status), "Showtime status updated successfully");
    }
}
