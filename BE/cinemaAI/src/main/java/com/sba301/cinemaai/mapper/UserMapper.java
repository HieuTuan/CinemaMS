package com.sba301.cinemaai.mapper;

import com.sba301.cinemaai.dto.user.UserProfileResponse;
import com.sba301.cinemaai.entity.User;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserProfileResponse toProfile(User user, List<String> roles) {
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getStatus(),
                user.isEmailVerified(),
                roles,
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
