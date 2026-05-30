package com.sba301.cinemaai.service;

import com.sba301.cinemaai.dto.booking.BookingFoodRequest;
import com.sba301.cinemaai.dto.booking.BookingResponse;
import com.sba301.cinemaai.dto.booking.CreateBookingRequest;
import com.sba301.cinemaai.dto.booking.HoldSeatsRequest;
import com.sba301.cinemaai.entity.Booking;
import com.sba301.cinemaai.entity.BookingFoodItem;
import com.sba301.cinemaai.entity.BookingSeat;
import com.sba301.cinemaai.entity.FoodCombo;
import com.sba301.cinemaai.entity.FoodItem;
import com.sba301.cinemaai.entity.Seat;
import com.sba301.cinemaai.entity.Showtime;
import com.sba301.cinemaai.entity.User;
import com.sba301.cinemaai.enums.BookingStatus;
import com.sba301.cinemaai.enums.FoodItemStatus;
import com.sba301.cinemaai.enums.SeatRuntimeStatus;
import com.sba301.cinemaai.enums.SeatStatus;
import com.sba301.cinemaai.enums.ShowtimeStatus;
import com.sba301.cinemaai.exception.BadRequestException;
import com.sba301.cinemaai.exception.ConflictException;
import com.sba301.cinemaai.exception.NotFoundException;
import com.sba301.cinemaai.mapper.BookingMapper;
import com.sba301.cinemaai.repository.BookingFoodItemRepository;
import com.sba301.cinemaai.repository.BookingRepository;
import com.sba301.cinemaai.repository.BookingSeatRepository;
import com.sba301.cinemaai.repository.SeatRepository;
import com.sba301.cinemaai.repository.ShowtimeRepository;
import com.sba301.cinemaai.service.LoyaltyPointService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final int HOLD_MINUTES = 10;
    private static final List<SeatRuntimeStatus> BLOCKING_SEAT_STATUSES = List.of(
            SeatRuntimeStatus.HOLDING,
            SeatRuntimeStatus.BOOKED,
            SeatRuntimeStatus.CHECKED_IN
    );

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final BookingFoodItemRepository bookingFoodItemRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final UserService userService;
    private final FoodService foodService;
    private final QrTicketService qrTicketService;
    private final BookingMapper bookingMapper;
    private final LoyaltyPointService loyaltyPointService;

    @Transactional
    public BookingResponse holdSeats(String email, HoldSeatsRequest request) {
        releaseExpiredHolds();
        User user = userService.getByEmail(email);
        Showtime showtime = findShowtime(request.showtimeId());
        if (showtime.getStatus() != ShowtimeStatus.OPEN && showtime.getStatus() != ShowtimeStatus.SCHEDULED) {
            throw new BadRequestException("Showtime is not open for booking");
        }

        Booking booking = bookingRepository.save(new Booking(newBookingCode(), user, showtime,
                LocalDateTime.now().plusMinutes(HOLD_MINUTES)));
        BigDecimal subtotal = BigDecimal.ZERO;

        for (Long seatId : request.seatIds().stream().distinct().toList()) {
            Seat seat = findSeat(seatId);
            validateSeatForShowtime(showtime, seat);
            BookingSeat bookingSeat = bookingSeatRepository.save(new BookingSeat(booking, showtime, seat, showtime.getBasePrice()));
            subtotal = subtotal.add(bookingSeat.getUnitPrice());
        }

        booking.updateAmounts(subtotal, BigDecimal.ZERO, subtotal);
        return toResponse(booking);
    }

    @Transactional
    public BookingResponse createBooking(String email, CreateBookingRequest request) {
        releaseExpiredHolds();
        User user = userService.getByEmail(email);
        Booking booking = findBooking(request.holdBookingId());
        validateOwner(booking, user);
        if (booking.getStatus() != BookingStatus.HOLDING) {
            throw new BadRequestException("Booking is not in holding status");
        }
        if (booking.getHoldExpiresAt() != null && booking.getHoldExpiresAt().isBefore(LocalDateTime.now())) {
            expireBooking(booking);
            throw new BadRequestException("Seat hold has expired");
        }

        BigDecimal subtotal = booking.getSubtotal();
        if (request.foods() != null) {
            for (BookingFoodRequest foodRequest : request.foods()) {
                BookingFoodItem item = createFoodItem(booking, foodRequest);
                bookingFoodItemRepository.save(item);
                subtotal = subtotal.add(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            }
        }

        bookingSeatRepository.findByBooking(booking)
                .forEach(seat -> seat.changeStatus(SeatRuntimeStatus.BOOKED));
        booking.updateAmounts(subtotal, BigDecimal.ZERO, subtotal);
        booking.markPaid(qrTicketService.generate(booking));
        loyaltyPointService.addPointsFromBooking(user, booking);
        return toResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(String email) {
        User user = userService.getByEmail(email);
        return bookingRepository.findByUser(user).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public BookingResponse getMyBooking(String email, Long bookingId) {
        User user = userService.getByEmail(email);
        Booking booking = findBooking(bookingId);
        validateOwner(booking, user);
        return toResponse(booking);
    }

    @Transactional
    public BookingResponse cancel(String email, Long bookingId) {
        User user = userService.getByEmail(email);
        Booking booking = findBooking(bookingId);
        validateOwner(booking, user);
        if (booking.getStatus() == BookingStatus.USED) {
            throw new BadRequestException("Checked-in booking cannot be cancelled");
        }
        releaseSeats(booking);
        booking.cancel();
        return toResponse(booking);
    }

    @Transactional
    public BookingResponse checkIn(String qrCode) {
        String bookingCode;
        try {
            bookingCode = qrTicketService.extractBookingCode(qrCode);
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException(exception.getMessage());
        }
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new NotFoundException("Booking not found"));
        if (booking.getStatus() != BookingStatus.PAID) {
            throw new BadRequestException("Only paid booking can be checked in");
        }
        booking.checkIn();
        bookingSeatRepository.findByBooking(booking)
                .forEach(seat -> seat.changeStatus(SeatRuntimeStatus.CHECKED_IN));
        return toResponse(booking);
    }

    private BookingFoodItem createFoodItem(Booking booking, BookingFoodRequest request) {
        if ((request.foodItemId() == null && request.foodComboId() == null)
                || (request.foodItemId() != null && request.foodComboId() != null)) {
            throw new BadRequestException("Choose exactly one food item or combo");
        }
        if (request.quantity() <= 0) {
            throw new BadRequestException("Quantity must be positive");
        }
        if (request.foodItemId() != null) {
            FoodItem foodItem = foodService.findItem(request.foodItemId());
            if (foodItem.getStatus() != FoodItemStatus.ACTIVE) {
                throw new BadRequestException("Food item is not available");
            }
            return new BookingFoodItem(booking, foodItem, null, request.quantity(), foodItem.getPrice());
        }
        FoodCombo foodCombo = foodService.findCombo(request.foodComboId());
        if (foodCombo.getStatus() != FoodItemStatus.ACTIVE) {
            throw new BadRequestException("Food combo is not available");
        }
        return new BookingFoodItem(booking, null, foodCombo, request.quantity(), foodCombo.getPrice());
    }

    private void validateSeatForShowtime(Showtime showtime, Seat seat) {
        if (!seat.getRoom().getId().equals(showtime.getRoom().getId())) {
            throw new BadRequestException("Seat does not belong to showtime room");
        }
        if (seat.getStatus() != SeatStatus.AVAILABLE) {
            throw new BadRequestException("Seat is not available");
        }
        boolean blocked = bookingSeatRepository
                .findByShowtimeAndSeatAndStatusIn(showtime, seat, BLOCKING_SEAT_STATUSES)
                .stream()
                .anyMatch(this::isBlockingSeat);
        if (blocked) {
            throw new ConflictException("Seat is already held or booked");
        }
    }

    private boolean isBlockingSeat(BookingSeat bookingSeat) {
        Booking booking = bookingSeat.getBooking();
        if (bookingSeat.getStatus() == SeatRuntimeStatus.HOLDING && booking.getStatus() == BookingStatus.HOLDING) {
            return booking.getHoldExpiresAt() == null || booking.getHoldExpiresAt().isAfter(LocalDateTime.now());
        }
        return bookingSeat.getStatus() == SeatRuntimeStatus.BOOKED
                || bookingSeat.getStatus() == SeatRuntimeStatus.CHECKED_IN;
    }

    private void releaseExpiredHolds() {
        bookingRepository.findByStatusAndHoldExpiresAtBefore(BookingStatus.HOLDING, LocalDateTime.now())
                .forEach(this::expireBooking);
    }

    private void expireBooking(Booking booking) {
        releaseSeats(booking);
        booking.expire();
    }

    private void releaseSeats(Booking booking) {
        bookingSeatRepository.findByBooking(booking)
                .forEach(seat -> seat.changeStatus(SeatRuntimeStatus.RELEASED));
    }

    private BookingResponse toResponse(Booking booking) {
        return bookingMapper.toResponse(
                booking,
                bookingSeatRepository.findByBooking(booking),
                bookingFoodItemRepository.findByBooking(booking)
        );
    }

    private void validateOwner(Booking booking, User user) {
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new NotFoundException("Booking not found");
        }
    }

    private Showtime findShowtime(Long id) {
        return showtimeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Showtime not found"));
    }

    private Seat findSeat(Long id) {
        return seatRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Seat not found"));
    }

    private Booking findBooking(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Booking not found"));
    }

    private String newBookingCode() {
        return "BK" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }
}
