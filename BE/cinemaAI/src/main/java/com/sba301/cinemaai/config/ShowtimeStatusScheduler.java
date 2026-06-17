package com.sba301.cinemaai.config;

import com.sba301.cinemaai.entity.Showtime;
import com.sba301.cinemaai.enums.ShowtimeStatus;
import com.sba301.cinemaai.repository.ShowtimeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduler tự động cập nhật trạng thái suất chiếu:
 * - SCHEDULED → OPEN  : khi startTime còn trong vòng 30 phút
 * - OPEN      → COMPLETED: khi endTime đã qua
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(
        prefix = "app.showtime.status-scheduler",
        name = "enabled",
        havingValue = "true",
        matchIfMissing = true
)
public class ShowtimeStatusScheduler {

    private static final int OPEN_BEFORE_MINUTES = 30;

    private final ShowtimeRepository showtimeRepository;

    @Scheduled(fixedDelayString = "${app.showtime.status-scheduler.fixed-delay-ms:60000}")
    @Transactional
    public void updateShowtimeStatuses() {
        LocalDateTime now = LocalDateTime.now();
        int opened = autoOpenScheduledShowtimes(now);
        int completed = autoCompleteEndedShowtimes(now);
        if (opened > 0 || completed > 0) {
            log.info("Showtime scheduler: opened={}, completed={}", opened, completed);
        }
    }

    private int autoOpenScheduledShowtimes(LocalDateTime now) {
        LocalDateTime cutoff = now.plusMinutes(OPEN_BEFORE_MINUTES);
        List<Showtime> toOpen = showtimeRepository.findByStatus(ShowtimeStatus.SCHEDULED)
                .stream()
                .filter(s -> !s.getStartTime().isAfter(cutoff))
                .toList();

        toOpen.forEach(showtime -> {
            showtime.changeStatus(ShowtimeStatus.OPEN);
            log.debug("Auto-opened showtime id={} startTime={}", showtime.getId(), showtime.getStartTime());
        });

        if (!toOpen.isEmpty()) {
            showtimeRepository.saveAll(toOpen);
        }
        return toOpen.size();
    }

    private int autoCompleteEndedShowtimes(LocalDateTime now) {
        List<Showtime> toComplete = showtimeRepository.findByStatus(ShowtimeStatus.OPEN)
                .stream()
                .filter(s -> s.getEndTime().isBefore(now))
                .toList();

        toComplete.forEach(showtime -> {
            showtime.changeStatus(ShowtimeStatus.COMPLETED);
            log.debug("Auto-completed showtime id={} endTime={}", showtime.getId(), showtime.getEndTime());
        });

        if (!toComplete.isEmpty()) {
            showtimeRepository.saveAll(toComplete);
        }
        return toComplete.size();
    }
}
