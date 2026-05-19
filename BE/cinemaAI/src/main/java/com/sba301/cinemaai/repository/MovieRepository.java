package com.sba301.cinemaai.repository;

import com.sba301.cinemaai.entity.Movie;
import com.sba301.cinemaai.enums.MovieStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovieRepository extends JpaRepository<Movie, Long> {

    Optional<Movie> findByTitle(String title);

    boolean existsByTitle(String title);

    List<Movie> findByStatus(MovieStatus status);

    List<Movie> findByReleaseDateBetween(LocalDate from, LocalDate to);
}
