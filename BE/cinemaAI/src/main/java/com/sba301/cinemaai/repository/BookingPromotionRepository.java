package com.sba301.cinemaai.repository;

import com.sba301.cinemaai.entity.Booking;
import com.sba301.cinemaai.entity.BookingPromotion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingPromotionRepository extends JpaRepository<BookingPromotion, Long> {

    boolean existsByBooking(Booking booking);
}
