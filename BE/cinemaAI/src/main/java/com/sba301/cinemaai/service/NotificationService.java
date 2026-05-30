package com.sba301.cinemaai.service;

import com.sba301.cinemaai.dto.notification.NotificationCreateRequest;
import com.sba301.cinemaai.dto.notification.NotificationResponse;
import java.util.List;

public interface NotificationService {

    NotificationResponse createForUser(NotificationCreateRequest request);

    List<NotificationResponse> getMyNotifications(Long userId);

    List<NotificationResponse> getMyUnread(Long userId);

    NotificationResponse markRead(Long userId, Long notificationId);
}
