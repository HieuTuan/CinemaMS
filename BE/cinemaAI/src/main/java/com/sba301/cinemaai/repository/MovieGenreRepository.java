package com.sba301.cinemaai.repository;

import com.sba301.cinemaai.entity.Genre;
import com.sba301.cinemaai.entity.Movie;
import com.sba301.cinemaai.entity.MovieGenre;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovieGenreRepository extends JpaRepository<MovieGenre, Long> {

    List<MovieGenre> findByMovie(Movie movie);

    List<MovieGenre> findByGenre(Genre genre);

    boolean existsByMovieAndGenre(Movie movie, Genre genre);
}
