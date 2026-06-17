package com.sba301.cinemaai.repository;

import com.sba301.cinemaai.entity.Booking;
import com.sba301.cinemaai.entity.Showtime;
import com.sba301.cinemaai.entity.User;
import com.sba301.cinemaai.enums.BookingStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    boolean existsByBookingCode(String bookingCode);

    Optional<Booking> findByBookingCode(String bookingCode);

    List<Booking> findByUser(User user);

    List<Booking> findByShowtime(Showtime showtime);

    boolean existsByShowtimeAndStatusIn(Showtime showtime, Collection<BookingStatus> statuses);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByStatusAndHoldExpiresAtBefore(BookingStatus status, LocalDateTime expiresAt);

    // ---- Report queries ----

    @Query("""
            select b from Booking b
            join fetch b.showtime s
            join fetch s.room r
            join fetch s.movie m
            where b.status = com.sba301.cinemaai.enums.BookingStatus.PAID
              and (:cinemaId is null or r.cinema.id = :cinemaId)
              and b.paidAt >= :from
              and b.paidAt <  :to
            """)
    List<Booking> findPaidBetween(
            @Param("cinemaId") Long cinemaId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    @Query("""
            select coalesce(sum(b.totalAmount), 0)
            from Booking b
            where b.status = com.sba301.cinemaai.enums.BookingStatus.PAID
              and (:cinemaId is null or b.showtime.room.cinema.id = :cinemaId)
              and b.paidAt >= :from
              and b.paidAt <  :to
            """)
    BigDecimal sumRevenueBetween(
            @Param("cinemaId") Long cinemaId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    @Query("""
            select count(b)
            from Booking b
            where b.status = com.sba301.cinemaai.enums.BookingStatus.PAID
              and (:cinemaId is null or b.showtime.room.cinema.id = :cinemaId)
              and b.paidAt >= :from
              and b.paidAt <  :to
            """)
    long countPaidBetween(
            @Param("cinemaId") Long cinemaId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );
}
