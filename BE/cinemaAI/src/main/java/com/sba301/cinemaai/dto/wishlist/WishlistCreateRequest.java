package com.sba301.cinemaai.dto.wishlist;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class WishlistCreateRequest {

    @NotNull(message = "Movie ID is required")
    private Long movieId;
}
