package com.sneakx.controller;

import com.sneakx.dto.ApiResponse;
import com.sneakx.dto.CheckoutRequest;
import com.sneakx.dto.OrderDto;
import com.sneakx.security.UserPrincipal;
import com.sneakx.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderDto>> checkout(@AuthenticationPrincipal UserPrincipal principal,
                                                          @Valid @RequestBody CheckoutRequest request) {
        OrderDto order = orderService.checkout(principal.getId(), request);
        return new ResponseEntity<>(ApiResponse.success("Order placed successfully", order), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderDto>>> getUserOrders(@AuthenticationPrincipal UserPrincipal principal) {
        List<OrderDto> orders = orderService.getUserOrders(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Order history retrieved", orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(@AuthenticationPrincipal UserPrincipal principal,
                                                              @PathVariable Long id) {
        boolean isAdmin = principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        OrderDto order = orderService.getOrderById(principal.getId(), id, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Order retrieved", order));
    }
}
