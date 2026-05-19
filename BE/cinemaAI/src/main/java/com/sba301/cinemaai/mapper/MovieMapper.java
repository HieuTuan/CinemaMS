package com.sba301.cinemaai.mapper;

import com.sba301.cinemaai.dto.movie.GenreResponse;
import com.sba301.cinemaai.dto.movie.MovieResponse;
import com.sba301.cinemaai.entity.Genre;
import com.sba301.cinemaai.entity.Movie;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class MovieMapper {

    public GenreResponse toGenreResponse(Genre genre) {
        return new GenreResponse(
                genre.getId(),
                genre.getName(),
                genre.getDescription(),
                genre.getCreatedAt(),
                genre.getUpdatedAt()
        );
    }

    public MovieResponse toMovieResponse(Movie movie, List<Genre> genres) {
        return new MovieResponse(
                movie.getId(),
                movie.getTitle(),
                movie.getDescription(),
                movie.getTrailerUrl(),
                movie.getPosterUrl(),
                movie.getDurationMinutes(),
                movie.getReleaseDate(),
                movie.getLanguage(),
                movie.getSubtitleLanguage(),
                movie.getStatus(),
                movie.getAgeRating(),
                movie.getDirector(),
                movie.getCastList(),
                genres.stream().map(this::toGenreResponse).toList(),
                movie.getCreatedAt(),
                movie.getUpdatedAt()
        );
    }
}
