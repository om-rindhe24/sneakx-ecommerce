package com.sneakx.controller;

import com.sneakx.dto.ApiResponse;
import com.sneakx.dto.WishlistDto;
import com.sneakx.security.UserPrincipal;
import com.sneakx.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<WishlistDto>> getWishlist(@AuthenticationPrincipal UserPrincipal principal) {
        WishlistDto wishlist = wishlistService.getWishlistDtoForUser(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Wishlist retrieved", wishlist));
    }

    @PostMapping("/toggle/{productId}")
    public ResponseEntity<ApiResponse<WishlistDto>> toggleWishlist(@AuthenticationPrincipal UserPrincipal principal,
                                                                   @PathVariable Long productId) {
        WishlistDto wishlist = wishlistService.toggleWishlist(principal.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Wishlist updated", wishlist));
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<ApiResponse<Boolean>> checkWishlist(@AuthenticationPrincipal UserPrincipal principal,
                                                              @PathVariable Long productId) {
        Boolean inWishlist = wishlistService.isInWishlist(principal.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success(inWishlist));
    }
}
