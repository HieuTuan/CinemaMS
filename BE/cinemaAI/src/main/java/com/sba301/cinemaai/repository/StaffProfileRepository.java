package com.sba301.cinemaai.repository;

import com.sba301.cinemaai.entity.Cinema;
import com.sba301.cinemaai.entity.StaffProfile;
import com.sba301.cinemaai.entity.User;
import com.sba301.cinemaai.enums.StaffStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StaffProfileRepository extends JpaRepository<StaffProfile, Long> {

    Optional<StaffProfile> findByUser(User user);

    Optional<StaffProfile> findByEmployeeCode(String employeeCode);

    boolean existsByEmployeeCode(String employeeCode);

    List<StaffProfile> findByCinema(Cinema cinema);

    List<StaffProfile> findByStatus(StaffStatus status);

    Page<StaffProfile> findByCinema(Cinema cinema, Pageable pageable);

    @Query("""
            select s from StaffProfile s
            where (:cinemaId is null or s.cinema.id = :cinemaId)
              and (:status   is null or s.status    = :status)
            order by s.user.profile.fullName asc
            """)
    Page<StaffProfile> search(
            @Param("cinemaId") Long cinemaId,
            @Param("status") StaffStatus status,
            Pageable pageable
    );

    long countByCinema(Cinema cinema);
}
