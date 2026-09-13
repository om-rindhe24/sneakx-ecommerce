package com.sneakx.controller;

import com.sneakx.dto.*;
import com.sneakx.security.UserPrincipal;
import com.sneakx.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Initiates a Razorpay order for authenticated user with requested amount (in rupees).
     */
    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<PaymentOrderResponse>> createPaymentOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) CreatePaymentOrderRequest request) {
        PaymentOrderResponse response = paymentService.createPaymentOrder(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Payment order created successfully", response));
    }

    /**
     * Verifies the Razorpay payment HMAC-SHA256 signature and confirms the order atomically.
     */
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<OrderDto>> verifyPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PaymentVerificationRequest request) {
        OrderDto confirmedOrder = paymentService.verifyPaymentAndConfirmOrder(principal.getId(), request);
        return new ResponseEntity<>(ApiResponse.success("Payment verified and order confirmed", confirmedOrder), HttpStatus.CREATED);
    }
}
