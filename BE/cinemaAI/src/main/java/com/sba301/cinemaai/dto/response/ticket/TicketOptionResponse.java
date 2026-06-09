package com.sba301.cinemaai.dto.response.ticket;

import com.sba301.cinemaai.enums.TicketType;

public record TicketOptionResponse(
        TicketType ticketType,
        int minimumAge,
        int maximumAge,
        int discountPercent
) {
}
