package com.sba301.cinemaai.repository;

import com.sba301.cinemaai.entity.Movie;
import com.sba301.cinemaai.entity.Room;
import com.sba301.cinemaai.entity.Showtime;
import com.sba301.cinemaai.enums.ShowtimeStatus;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {

    List<Showtime> findByMovie(Movie movie);

    List<Showtime> findByRoom(Room room);

    List<Showtime> findByStatus(ShowtimeStatus status);

    List<Showtime> findByStartTimeBetween(LocalDateTime from, LocalDateTime to);
}
