package com.sba301.cinemaai.entity;

import com.sba301.cinemaai.enums.LoyaltyPointType;
import com.sba301.cinemaai.enums.LoyaltyTier;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
        name = "loyalty_points",
        indexes = @Index(name = "idx_loyalty_points_user", columnList = "user_id")
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LoyaltyPoint extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @Column(nullable = false)
    private int points;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private LoyaltyPointType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private LoyaltyTier tier = LoyaltyTier.BRONZE;

    @Column(nullable = false, length = 500)
    private String reason;

    public LoyaltyPoint(User user, Booking booking, int points, LoyaltyPointType type, LoyaltyTier tier, String reason) {
        this.user = user;
        this.booking = booking;
        this.points = points;
        this.type = type;
        this.tier = tier;
        this.reason = reason;
    }
}
