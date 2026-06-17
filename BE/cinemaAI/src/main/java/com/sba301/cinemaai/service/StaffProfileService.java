package com.sba301.cinemaai.service;

import com.sba301.cinemaai.dto.request.staff.CreateStaffRequest;
import com.sba301.cinemaai.dto.request.staff.UpdateStaffRequest;
import com.sba301.cinemaai.dto.request.staff.UpdateStaffStatusRequest;
import com.sba301.cinemaai.dto.response.PageResponse;
import com.sba301.cinemaai.dto.response.staff.StaffProfileResponse;
import com.sba301.cinemaai.entity.Cinema;
import com.sba301.cinemaai.entity.StaffProfile;
import com.sba301.cinemaai.entity.User;
import com.sba301.cinemaai.enums.RoleName;
import com.sba301.cinemaai.enums.StaffStatus;
import com.sba301.cinemaai.exception.ConflictException;
import com.sba301.cinemaai.exception.NotFoundException;
import com.sba301.cinemaai.repository.CinemaRepository;
import com.sba301.cinemaai.repository.StaffProfileRepository;
import com.sba301.cinemaai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StaffProfileService {

    private final StaffProfileRepository staffProfileRepository;
    private final UserRepository userRepository;
    private final CinemaRepository cinemaRepository;
    private final UserRoleService userRoleService;

    @Transactional(readOnly = true)
    public PageResponse<StaffProfileResponse> search(Long cinemaId, StaffStatus status, Pageable pageable) {
        return PageResponse.from(
                staffProfileRepository.search(cinemaId, status, pageable)
                        .map(StaffProfileResponse::from)
        );
    }

    @Transactional(readOnly = true)
    public StaffProfileResponse getById(Long id) {
        return StaffProfileResponse.from(findById(id));
    }

    @Transactional
    public StaffProfileResponse create(CreateStaffRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (staffProfileRepository.findByUser(user).isPresent()) {
            throw new ConflictException("User already has a staff profile");
        }

        if (staffProfileRepository.existsByEmployeeCode(request.employeeCode())) {
            throw new ConflictException("Employee code already exists");
        }

        Cinema cinema = resolveCinema(request.cinemaId());
        StaffProfile profile = staffProfileRepository.save(
                new StaffProfile(user, cinema, request.employeeCode(), request.position())
        );

        userRoleService.assignRole(user, RoleName.STAFF);

        return StaffProfileResponse.from(profile);
    }

    @Transactional
    public StaffProfileResponse update(Long id, UpdateStaffRequest request) {
        StaffProfile profile = findById(id);
        Cinema cinema = resolveCinema(request.cinemaId());
        profile.updateInfo(cinema, request.position());
        return StaffProfileResponse.from(profile);
    }

    @Transactional
    public StaffProfileResponse changeStatus(Long id, UpdateStaffStatusRequest request) {
        StaffProfile profile = findById(id);
        profile.changeStatus(request.status());
        return StaffProfileResponse.from(profile);
    }

    public StaffProfile findById(Long id) {
        return staffProfileRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Staff profile not found"));
    }

    private Cinema resolveCinema(Long cinemaId) {
        if (cinemaId == null) return null;
        return cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new NotFoundException("Cinema not found"));
    }
}
