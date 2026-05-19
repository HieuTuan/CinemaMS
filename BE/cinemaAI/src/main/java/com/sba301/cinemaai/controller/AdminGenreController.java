package com.sba301.cinemaai.controller;

import com.sba301.cinemaai.dto.movie.GenreRequest;
import com.sba301.cinemaai.dto.movie.GenreResponse;
import com.sba301.cinemaai.dto.response.ApiResponse;
import com.sba301.cinemaai.service.GenreService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/genres")
@RequiredArgsConstructor
public class AdminGenreController {

    private final GenreService genreService;

    @GetMapping
    public ApiResponse<List<GenreResponse>> getGenres() {
        return ApiResponse.success(genreService.getGenres());
    }

    @GetMapping("/{genreId}")
    public ApiResponse<GenreResponse> getGenre(@PathVariable Long genreId) {
        return ApiResponse.success(genreService.getGenre(genreId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<GenreResponse> createGenre(@Valid @RequestBody GenreRequest request) {
        return ApiResponse.success(genreService.create(request), "Genre created successfully");
    }

    @PutMapping("/{genreId}")
    public ApiResponse<GenreResponse> updateGenre(
            @PathVariable Long genreId,
            @Valid @RequestBody GenreRequest request
    ) {
        return ApiResponse.success(genreService.update(genreId, request), "Genre updated successfully");
    }

    @DeleteMapping("/{genreId}")
    public ApiResponse<Void> deleteGenre(@PathVariable Long genreId) {
        genreService.delete(genreId);
        return ApiResponse.success(null, "Genre deleted successfully");
    }
}
