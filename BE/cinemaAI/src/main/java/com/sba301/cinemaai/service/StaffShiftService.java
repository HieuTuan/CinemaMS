package com.sba301.cinemaai.service;

import com.sba301.cinemaai.dto.request.staff.CreateShiftRequest;
import com.sba301.cinemaai.dto.request.staff.UpdateShiftRequest;
import com.sba301.cinemaai.dto.response.PageResponse;
import com.sba301.cinemaai.dto.response.staff.StaffShiftResponse;
import com.sba301.cinemaai.entity.StaffProfile;
import com.sba301.cinemaai.entity.StaffShift;
import com.sba301.cinemaai.exception.BadRequestException;
import com.sba301.cinemaai.exception.NotFoundException;
import com.sba301.cinemaai.repository.StaffShiftRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StaffShiftService {

    private final StaffShiftRepository staffShiftRepository;
    private final StaffProfileService staffProfileService;

    @Transactional(readOnly = true)
    public PageResponse<StaffShiftResponse> search(
            Long staffProfileId,
            Long cinemaId,
            LocalDate from,
            LocalDate to,
            Pageable pageable
    ) {
        LocalDateTime fromDt = from != null ? from.atStartOfDay() : LocalDateTime.now().minusMonths(1);
        LocalDateTime toDt   = to   != null ? to.plusDays(1).atStartOfDay() : LocalDateTime.now().plusMonths(1);

        return PageResponse.from(
                staffShiftRepository.search(staffProfileId, cinemaId, fromDt, toDt, pageable)
                        .map(StaffShiftResponse::from)
        );
    }

    @Transactional(readOnly = true)
    public List<StaffShiftResponse> getShiftsByStaff(Long staffProfileId, LocalDate from, LocalDate to) {
        StaffProfile profile = staffProfileService.findById(staffProfileId);
        LocalDateTime fromDt = from != null ? from.atStartOfDay() : LocalDateTime.now().minusMonths(1);
        LocalDateTime toDt   = to   != null ? to.plusDays(1).atStartOfDay() : LocalDateTime.now().plusMonths(1);

        return staffShiftRepository
                .findByStaffProfileAndStartTimeBetween(profile, fromDt, toDt)
                .stream()
                .map(StaffShiftResponse::from)
                .toList();
    }

    @Transactional
    public StaffShiftResponse create(CreateShiftRequest request) {
        validateTimes(request.startTime(), request.endTime());

        StaffProfile profile = staffProfileService.findById(request.staffProfileId());

        if (hasOverlap(profile, request.startTime(), request.endTime(), null)) {
            throw new BadRequestException("Shift overlaps with an existing shift for this staff member");
        }

        StaffShift shift = staffShiftRepository.save(
                new StaffShift(profile, request.startTime(), request.endTime(), request.note())
        );
        return StaffShiftResponse.from(shift);
    }

    @Transactional
    public StaffShiftResponse update(Long id, UpdateShiftRequest request) {
        validateTimes(request.startTime(), request.endTime());

        StaffShift shift = findById(id);

        if (hasOverlap(shift.getStaffProfile(), request.startTime(), request.endTime(), id)) {
            throw new BadRequestException("Shift overlaps with an existing shift for this staff member");
        }

        shift.update(request.startTime(), request.endTime(), request.note());
        return StaffShiftResponse.from(shift);
    }

    @Transactional
    public void delete(Long id) {
        staffShiftRepository.delete(findById(id));
    }

    public StaffShift findById(Long id) {
        return staffShiftRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Shift not found"));
    }

    private void validateTimes(LocalDateTime startTime, LocalDateTime endTime) {
        if (!endTime.isAfter(startTime)) {
            throw new BadRequestException("End time must be after start time");
        }
    }

    private boolean hasOverlap(StaffProfile profile, LocalDateTime startTime, LocalDateTime endTime, Long excludeId) {
        return staffShiftRepository
                .findByStaffProfileAndStartTimeBetween(profile, startTime.minusDays(1), endTime.plusDays(1))
                .stream()
                .filter(s -> excludeId == null || !s.getId().equals(excludeId))
                .anyMatch(s -> s.getStartTime().isBefore(endTime) && s.getEndTime().isAfter(startTime));
    }
}
