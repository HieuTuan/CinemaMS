package com.sba301.cinemaai.controller;

import com.sba301.cinemaai.dto.request.staff.CreateShiftRequest;
import com.sba301.cinemaai.dto.request.staff.UpdateShiftRequest;
import com.sba301.cinemaai.dto.response.ApiResponse;
import com.sba301.cinemaai.dto.response.PageResponse;
import com.sba301.cinemaai.dto.response.staff.StaffShiftResponse;
import com.sba301.cinemaai.service.StaffShiftService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/staff-shifts")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Admin Staff Shifts", description = "Staff shift management - requires ADMIN role")
public class AdminStaffShiftController {

    private final StaffShiftService staffShiftService;

    @GetMapping
    @Operation(summary = "Search shifts", description = "Paginated shift list with optional staff/cinema/date filter")
    public ApiResponse<PageResponse<StaffShiftResponse>> search(
            @RequestParam(required = false) Long staffProfileId,
            @RequestParam(required = false) Long cinemaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.success(
                staffShiftService.search(
                        staffProfileId, cinemaId, from, to,
                        PageRequest.of(page, size, Sort.by("startTime").ascending())
                )
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create shift")
    public ApiResponse<StaffShiftResponse> create(@Valid @RequestBody CreateShiftRequest request) {
        return ApiResponse.success(staffShiftService.create(request), "Shift created successfully");
    }

    @PutMapping("/{shiftId}")
    @Operation(summary = "Update shift")
    public ApiResponse<StaffShiftResponse> update(
            @PathVariable Long shiftId,
            @Valid @RequestBody UpdateShiftRequest request
    ) {
        return ApiResponse.success(staffShiftService.update(shiftId, request), "Shift updated successfully");
    }

    @DeleteMapping("/{shiftId}")
    @Operation(summary = "Delete shift")
    public ApiResponse<Void> delete(@PathVariable Long shiftId) {
        staffShiftService.delete(shiftId);
        return ApiResponse.success(null, "Shift deleted successfully");
    }
}
