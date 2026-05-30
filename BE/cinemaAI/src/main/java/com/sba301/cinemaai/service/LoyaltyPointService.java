package com.sba301.cinemaai.service;

import com.sba301.cinemaai.dto.loyalty.LoyaltyAddRequest;
import com.sba301.cinemaai.dto.loyalty.LoyaltyResponse;
import com.sba301.cinemaai.entity.Booking;
import com.sba301.cinemaai.entity.User;

public interface LoyaltyPointService {

    /** Lấy (hoặc tạo mới) điểm loyalty của user hiện tại */
    LoyaltyResponse getMyPoints(String email);

    /** ADMIN: thêm điểm cho một user theo userId */
    LoyaltyResponse addPoints(LoyaltyAddRequest request);

    /** ADMIN: trừ điểm (redeem) cho một user */
    LoyaltyResponse redeemPoints(Long userId, int points);

    /** Internal: gọi từ BookingService sau khi thanh toán thành công */
    void addPointsFromBooking(User user, Booking booking);
}
