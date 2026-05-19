package com.sba301.cinemaai.service;

import com.sba301.cinemaai.dto.user.AdminUserStatusUpdateRequest;
import com.sba301.cinemaai.dto.user.UserProfileResponse;
import com.sba301.cinemaai.dto.user.UserProfileUpdateRequest;
import com.sba301.cinemaai.entity.User;
import com.sba301.cinemaai.enums.UserStatus;
import com.sba301.cinemaai.exception.BadRequestException;
import com.sba301.cinemaai.exception.NotFoundException;
import com.sba301.cinemaai.mapper.UserMapper;
import com.sba301.cinemaai.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserRoleService userRoleService;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String email) {
        User user = getByEmail(email);
        return toProfile(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(String email, UserProfileUpdateRequest request) {
        User user = getByEmail(email);
        user.updateProfile(request.fullName(), request.phone());
        return toProfile(user);
    }

    @Transactional(readOnly = true)
    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toProfile)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getById(Long id) {
        return toProfile(findById(id));
    }

    @Transactional
    public UserProfileResponse updateStatus(Long id, AdminUserStatusUpdateRequest request) {
        User user = findById(id);
        if (request.status() == UserStatus.DISABLED) {
            user.disable();
        } else if (request.status() == UserStatus.ACTIVE) {
            user.activateEmail();
        } else if (request.status() == UserStatus.PENDING_VERIFICATION) {
            throw new BadRequestException("Cannot move user back to pending verification");
        }
        return toProfile(user);
    }

    public UserProfileResponse toProfile(User user) {
        return userMapper.toProfile(user, userRoleService.getRoleNames(user.getId()));
    }

    private User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }
}
