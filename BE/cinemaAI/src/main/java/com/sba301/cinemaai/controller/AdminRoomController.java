package com.sba301.cinemaai.controller;

import com.sba301.cinemaai.dto.cinema.RoomRequest;
import com.sba301.cinemaai.dto.cinema.RoomResponse;
import com.sba301.cinemaai.dto.cinema.SeatGenerationRequest;
import com.sba301.cinemaai.dto.cinema.SeatResponse;
import com.sba301.cinemaai.dto.cinema.SeatUpdateRequest;
import com.sba301.cinemaai.dto.response.ApiResponse;
import com.sba301.cinemaai.enums.RoomStatus;
import com.sba301.cinemaai.service.RoomService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/rooms")
@RequiredArgsConstructor
public class AdminRoomController {

    private final RoomService roomService;

    @GetMapping("/{roomId}")
    public ApiResponse<RoomResponse> getRoom(@PathVariable Long roomId) {
        return ApiResponse.success(roomService.getRoom(roomId));
    }

    @GetMapping("/{roomId}/seats")
    public ApiResponse<List<SeatResponse>> getSeats(@PathVariable Long roomId) {
        return ApiResponse.success(roomService.getSeats(roomId));
    }

    @GetMapping("/seats/{seatId}")
    public ApiResponse<SeatResponse> getSeat(@PathVariable Long seatId) {
        return ApiResponse.success(roomService.getSeat(seatId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<RoomResponse> createRoom(@Valid @RequestBody RoomRequest request) {
        return ApiResponse.success(roomService.create(request), "Room created successfully");
    }

    @PutMapping("/{roomId}")
    public ApiResponse<RoomResponse> updateRoom(
            @PathVariable Long roomId,
            @Valid @RequestBody RoomRequest request
    ) {
        return ApiResponse.success(roomService.update(roomId, request), "Room updated successfully");
    }

    @PatchMapping("/{roomId}/status")
    public ApiResponse<RoomResponse> updateStatus(
            @PathVariable Long roomId,
            @RequestParam RoomStatus status
    ) {
        return ApiResponse.success(roomService.updateStatus(roomId, status), "Room status updated successfully");
    }

    @PostMapping("/{roomId}/seats/generate")
    public ApiResponse<List<SeatResponse>> generateSeats(
            @PathVariable Long roomId,
            @Valid @RequestBody SeatGenerationRequest request
    ) {
        return ApiResponse.success(roomService.generateSeats(roomId, request), "Seats generated successfully");
    }

    @PutMapping("/seats/{seatId}")
    public ApiResponse<SeatResponse> updateSeat(
            @PathVariable Long seatId,
            @Valid @RequestBody SeatUpdateRequest request
    ) {
        return ApiResponse.success(roomService.updateSeat(seatId, request), "Seat updated successfully");
    }

    @DeleteMapping("/seats/{seatId}")
    public ApiResponse<SeatResponse> deleteSeat(@PathVariable Long seatId) {
        return ApiResponse.success(roomService.deleteSeat(seatId), "Seat deleted successfully");
    }
}
