package com.sneakx.controller;

import com.sneakx.dto.ApiResponse;
import com.sneakx.dto.CouponValidationResponse;
import com.sneakx.dto.ValidateCouponRequest;
import com.sneakx.security.UserPrincipal;
import com.sneakx.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    /**
     * POST /api/coupons/validate — Validates a coupon code against customer's active cart.
     * Accessible to authenticated customers during checkout.
     */
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<CouponValidationResponse>> validateCoupon(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ValidateCouponRequest request) {

        Long userId = principal != null ? principal.getId() : null;
        CouponValidationResponse response = couponService.validateCoupon(userId, request.getCode(), request.getSubtotal());

        return ResponseEntity.ok(ApiResponse.success(
                "Coupon '" + response.getCode() + "' applied successfully!", response
        ));
    }
}
