package com.sba301.cinemaai.controller;

import com.sba301.cinemaai.dto.request.staff.CreateStaffRequest;
import com.sba301.cinemaai.dto.request.staff.UpdateStaffRequest;
import com.sba301.cinemaai.dto.request.staff.UpdateStaffStatusRequest;
import com.sba301.cinemaai.dto.response.ApiResponse;
import com.sba301.cinemaai.dto.response.PageResponse;
import com.sba301.cinemaai.dto.response.staff.StaffProfileResponse;
import com.sba301.cinemaai.dto.response.staff.StaffShiftResponse;
import com.sba301.cinemaai.enums.StaffStatus;
import com.sba301.cinemaai.service.StaffProfileService;
import com.sba301.cinemaai.service.StaffShiftService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
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
@RequestMapping("/api/v1/admin/staff")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Admin Staff", description = "Staff profile management - requires ADMIN role")
public class AdminStaffController {

    private final StaffProfileService staffProfileService;
    private final StaffShiftService staffShiftService;

    @GetMapping
    @Operation(summary = "List staff profiles", description = "Paginated search with optional cinema and status filter")
    public ApiResponse<PageResponse<StaffProfileResponse>> search(
            @RequestParam(required = false) Long cinemaId,
            @RequestParam(required = false) StaffStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.success(
                staffProfileService.search(cinemaId, status, PageRequest.of(page, size))
        );
    }

    @GetMapping("/{staffId}")
    @Operation(summary = "Get staff profile by ID")
    public ApiResponse<StaffProfileResponse> getById(@PathVariable Long staffId) {
        return ApiResponse.success(staffProfileService.getById(staffId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create staff profile", description = "Assigns STAFF role to the user automatically")
    public ApiResponse<StaffProfileResponse> create(@Valid @RequestBody CreateStaffRequest request) {
        return ApiResponse.success(staffProfileService.create(request), "Staff profile created successfully");
    }

    @PutMapping("/{staffId}")
    @Operation(summary = "Update staff profile", description = "Update cinema assignment and position")
    public ApiResponse<StaffProfileResponse> update(
            @PathVariable Long staffId,
            @Valid @RequestBody UpdateStaffRequest request
    ) {
        return ApiResponse.success(staffProfileService.update(staffId, request), "Staff profile updated successfully");
    }

    @PatchMapping("/{staffId}/status")
    @Operation(summary = "Change staff status", description = "Activate, deactivate or suspend a staff member")
    public ApiResponse<StaffProfileResponse> changeStatus(
            @PathVariable Long staffId,
            @Valid @RequestBody UpdateStaffStatusRequest request
    ) {
        return ApiResponse.success(staffProfileService.changeStatus(staffId, request), "Staff status updated");
    }

    @GetMapping("/{staffId}/shifts")
    @Operation(summary = "Get shifts for a staff member")
    public ApiResponse<List<StaffShiftResponse>> getShifts(
            @PathVariable Long staffId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ApiResponse.success(staffShiftService.getShiftsByStaff(staffId, from, to));
    }
}
