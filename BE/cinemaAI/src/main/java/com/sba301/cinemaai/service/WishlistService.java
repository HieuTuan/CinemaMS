package com.sba301.cinemaai.service;

import com.sba301.cinemaai.dto.wishlist.WishlistCreateRequest;
import com.sba301.cinemaai.dto.wishlist.WishlistResponse;
import java.util.List;

public interface WishlistService {

    WishlistResponse addToWishlist(String email, WishlistCreateRequest request);

    void removeFromWishlist(String email, Long movieId);

    List<WishlistResponse> getWishlist(String email);
}
