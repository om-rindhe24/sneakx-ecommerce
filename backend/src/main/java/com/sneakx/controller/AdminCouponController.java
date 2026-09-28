package com.sneakx.controller;

import com.sneakx.dto.ApiResponse;
import com.sneakx.dto.CouponDto;
import com.sneakx.dto.CreateCouponRequest;
import com.sneakx.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/coupons")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCouponController {

    private final CouponService couponService;

    public AdminCouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    /**
     * GET /api/admin/coupons — List all coupons with usage statistics.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CouponDto>>> getAllCoupons() {
        List<CouponDto> coupons = couponService.getAllCoupons();
        return ResponseEntity.ok(ApiResponse.success("Coupons retrieved successfully", coupons));
    }

    /**
     * POST /api/admin/coupons — Create a new discount coupon.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CouponDto>> createCoupon(@Valid @RequestBody CreateCouponRequest request) {
        CouponDto created = couponService.createCoupon(request);
        return new ResponseEntity<>(ApiResponse.success("Coupon created successfully", created), HttpStatus.CREATED);
    }

    /**
     * PUT /api/admin/coupons/{id} — Update an existing coupon.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CouponDto>> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CreateCouponRequest request) {
        CouponDto updated = couponService.updateCoupon(id, request);
        return ResponseEntity.ok(ApiResponse.success("Coupon updated successfully", updated));
    }

    /**
     * PATCH /api/admin/coupons/{id}/toggle — Toggle active state of a coupon.
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<CouponDto>> toggleCouponStatus(@PathVariable Long id) {
        CouponDto updated = couponService.toggleCouponStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon status toggled successfully", updated));
    }

    /**
     * DELETE /api/admin/coupons/{id} — Delete a coupon.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deleted successfully", null));
    }
}
