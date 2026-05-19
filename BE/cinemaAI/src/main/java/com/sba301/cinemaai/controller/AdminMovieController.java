package com.sba301.cinemaai.controller;

import com.sba301.cinemaai.dto.movie.MovieCreateRequest;
import com.sba301.cinemaai.dto.movie.MovieResponse;
import com.sba301.cinemaai.dto.movie.MovieStatusUpdateRequest;
import com.sba301.cinemaai.dto.movie.MovieUpdateRequest;
import com.sba301.cinemaai.dto.response.ApiResponse;
import com.sba301.cinemaai.dto.response.PageResponse;
import com.sba301.cinemaai.enums.MovieStatus;
import com.sba301.cinemaai.service.MovieService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
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
@RequestMapping("/api/v1/admin/movies")
@RequiredArgsConstructor
public class AdminMovieController {

    private final MovieService movieService;

    @GetMapping
    public ApiResponse<PageResponse<MovieResponse>> searchMovies(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) MovieStatus status,
            @RequestParam(required = false) Long genreId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.success(movieService.searchAdmin(keyword, status, genreId, fromDate, toDate, page, size));
    }

    @GetMapping("/{movieId}")
    public ApiResponse<MovieResponse> getMovie(@PathVariable Long movieId) {
        return ApiResponse.success(movieService.getAdmin(movieId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MovieResponse> createMovie(@Valid @RequestBody MovieCreateRequest request) {
        return ApiResponse.success(movieService.create(request), "Movie created successfully");
    }

    @PutMapping("/{movieId}")
    public ApiResponse<MovieResponse> updateMovie(
            @PathVariable Long movieId,
            @Valid @RequestBody MovieUpdateRequest request
    ) {
        return ApiResponse.success(movieService.update(movieId, request), "Movie updated successfully");
    }

    @PatchMapping("/{movieId}/status")
    public ApiResponse<MovieResponse> updateStatus(
            @PathVariable Long movieId,
            @Valid @RequestBody MovieStatusUpdateRequest request
    ) {
        return ApiResponse.success(movieService.updateStatus(movieId, request), "Movie status updated successfully");
    }

    @DeleteMapping("/{movieId}")
    public ApiResponse<Void> deleteMovie(@PathVariable Long movieId) {
        movieService.delete(movieId);
        return ApiResponse.success(null, "Movie deleted successfully");
    }
}
