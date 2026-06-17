package com.sba301.cinemaai.repository;

import com.sba301.cinemaai.entity.StaffProfile;
import com.sba301.cinemaai.entity.StaffShift;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StaffShiftRepository extends JpaRepository<StaffShift, Long> {

    List<StaffShift> findByStaffProfile(StaffProfile staffProfile);

    List<StaffShift> findByStartTimeBetween(LocalDateTime from, LocalDateTime to);

    List<StaffShift> findByStaffProfileAndStartTimeBetween(
            StaffProfile staffProfile,
            LocalDateTime from,
            LocalDateTime to
    );

    @Query("""
            select s from StaffShift s
            where (:staffProfileId is null or s.staffProfile.id = :staffProfileId)
              and (:cinemaId       is null or s.staffProfile.cinema.id = :cinemaId)
              and s.startTime >= :from
              and s.startTime <  :to
            order by s.startTime asc
            """)
    Page<StaffShift> search(
            @Param("staffProfileId") Long staffProfileId,
            @Param("cinemaId") Long cinemaId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            Pageable pageable
    );

    boolean existsByStaffProfileAndStartTimeLessThanAndEndTimeGreaterThan(
            StaffProfile staffProfile,
            LocalDateTime endTime,
            LocalDateTime startTime
    );
}
