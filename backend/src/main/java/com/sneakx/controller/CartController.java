package com.sneakx.controller;

import com.sneakx.dto.AddToCartRequest;
import com.sneakx.dto.ApiResponse;
import com.sneakx.dto.CartDto;
import com.sneakx.dto.UpdateCartItemRequest;
import com.sneakx.security.UserPrincipal;
import com.sneakx.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartDto>> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        CartDto cart = cartService.getCartDtoForUser(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved", cart));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartDto>> addItem(@AuthenticationPrincipal UserPrincipal principal,
                                                        @Valid @RequestBody AddToCartRequest request) {
        CartDto cart = cartService.addToCart(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", cart));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<ApiResponse<CartDto>> updateItemQuantity(@AuthenticationPrincipal UserPrincipal principal,
                                                                   @PathVariable Long id,
                                                                   @Valid @RequestBody UpdateCartItemRequest request) {
        CartDto cart = cartService.updateItemQuantity(principal.getId(), id, request.getQuantity());
        return ResponseEntity.ok(ApiResponse.success("Cart updated", cart));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<ApiResponse<CartDto>> removeItem(@AuthenticationPrincipal UserPrincipal principal,
                                                           @PathVariable Long id) {
        CartDto cart = cartService.removeItem(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(@AuthenticationPrincipal UserPrincipal principal) {
        cartService.clearCart(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully", null));
    }
}
