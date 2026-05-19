package com.sba301.cinemaai.repository;

import com.sba301.cinemaai.entity.Booking;
import com.sba301.cinemaai.entity.BookingFoodItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingFoodItemRepository extends JpaRepository<BookingFoodItem, Long> {

    List<BookingFoodItem> findByBooking(Booking booking);
}
