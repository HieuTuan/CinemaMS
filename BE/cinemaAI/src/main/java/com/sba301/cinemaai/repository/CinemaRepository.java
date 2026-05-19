package com.sba301.cinemaai.repository;

import com.sba301.cinemaai.entity.Cinema;
import com.sba301.cinemaai.enums.CinemaStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CinemaRepository extends JpaRepository<Cinema, Long> {

    List<Cinema> findByCity(String city);

    List<Cinema> findByStatus(CinemaStatus status);
}
