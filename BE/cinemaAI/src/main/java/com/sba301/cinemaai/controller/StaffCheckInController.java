package com.sba301.cinemaai.controller;

import com.sba301.cinemaai.dto.booking.BookingResponse;
import com.sba301.cinemaai.dto.booking.CheckInRequest;
import com.sba301.cinemaai.dto.response.ApiResponse;
import com.sba301.cinemaai.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/staff/check-in", "/api/v1/admin/check-in"})
@RequiredArgsConstructor
public class StaffCheckInController {

    private final BookingService bookingService;

    @PostMapping
    public ApiResponse<BookingResponse> checkIn(@Valid @RequestBody CheckInRequest request) {
        return ApiResponse.success(bookingService.checkIn(request.qrCode()), "Ticket checked in successfully");
    }
}
