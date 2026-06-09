package com.sba301.cinemaai.enums;

import java.math.BigDecimal;
import java.math.RoundingMode;

public enum TicketType {
    ADULT(18, 59, 0),
    CHILD(0, 12, 50),
    SENIOR(60, 150, 30),
    STUDENT(13, 25, 20);

    private final int minimumAge;
    private final int maximumAge;
    private final int discountPercent;

    TicketType(int minimumAge, int maximumAge, int discountPercent) {
        this.minimumAge = minimumAge;
        this.maximumAge = maximumAge;
        this.discountPercent = discountPercent;
    }

    public boolean allowsAge(int age) {
        return age >= minimumAge && age <= maximumAge;
    }

    public BigDecimal calculateDiscount(BigDecimal basePrice) {
        return basePrice.multiply(BigDecimal.valueOf(discountPercent))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateUnitPrice(BigDecimal basePrice) {
        return basePrice.subtract(calculateDiscount(basePrice));
    }

    public int getMinimumAge() {
        return minimumAge;
    }

    public int getMaximumAge() {
        return maximumAge;
    }

    public int getDiscountPercent() {
        return discountPercent;
    }
}
