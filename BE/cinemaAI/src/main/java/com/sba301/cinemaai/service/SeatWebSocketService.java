package com.sba301.cinemaai.service;

import com.sba301.cinemaai.dto.response.websocket.SeatStatusMessage;
import com.sba301.cinemaai.entity.BookingSeat;
import com.sba301.cinemaai.enums.SeatRuntimeStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeatWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcast a single seat status update to all clients watching the showtime's seat map.
     */
    public void broadcastSeatUpdate(BookingSeat bookingSeat) {
        Long showtimeId = bookingSeat.getShowtime().getId();
        SeatStatusMessage message = new SeatStatusMessage(
                showtimeId,
                bookingSeat.getSeat().getId(),
                bookingSeat.getSeat().getRowLabel(),
                bookingSeat.getSeat().getSeatNumber(),
                bookingSeat.getSeat().getSeatType(),
                bookingSeat.getStatus()
        );
        sendToTopic(showtimeId, message);
    }

    /**
     * Broadcast that a seat is now AVAILABLE again (released/expired).
     * This is needed when a BookingSeat is set to RELEASED and we want to notify
     * subscribers that the seat can be booked again.
     */
    public void broadcastSeatAvailable(BookingSeat bookingSeat) {
        Long showtimeId = bookingSeat.getShowtime().getId();
        SeatStatusMessage message = new SeatStatusMessage(
                showtimeId,
                bookingSeat.getSeat().getId(),
                bookingSeat.getSeat().getRowLabel(),
                bookingSeat.getSeat().getSeatNumber(),
                bookingSeat.getSeat().getSeatType(),
                SeatRuntimeStatus.RELEASED
        );
        sendToTopic(showtimeId, message);
    }

    /**
     * Broadcast status updates for multiple seats at once (e.g. on booking expiry).
     */
    public void broadcastSeatUpdates(List<BookingSeat> bookingSeats) {
        bookingSeats.forEach(this::broadcastSeatUpdate);
    }

    private void sendToTopic(Long showtimeId, SeatStatusMessage message) {
        String destination = "/topic/showtimes/" + showtimeId + "/seats";
        try {
            messagingTemplate.convertAndSend(destination, message);
            log.debug("Broadcast seat update: showtime={}, seat={}, status={}",
                    showtimeId, message.seatId(), message.status());
        } catch (Exception e) {
            log.warn("Failed to broadcast seat update for showtime={}, seat={}: {}",
                    showtimeId, message.seatId(), e.getMessage());
        }
    }
}
