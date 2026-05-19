package com.sba301.cinemaai.repository;

import com.sba301.cinemaai.entity.Room;
import com.sba301.cinemaai.entity.Seat;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByRoom(Room room);

    Optional<Seat> findByRoomAndRowLabelAndSeatNumber(Room room, String rowLabel, int seatNumber);
}
