package com.sneakx.controller;

import com.sneakx.dto.*;
import com.sneakx.service.AdminService;
import com.sneakx.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final OrderService orderService;

    public AdminController(AdminService adminService, OrderService orderService) {
        this.adminService = adminService;
        this.orderService = orderService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminStatsDto>> getDashboardStats() {
        AdminStatsDto stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard statistics", stats));
    }

    @PostMapping("/products")
    public ResponseEntity<ApiResponse<ProductDetailDto>> createProduct(@Valid @RequestBody CreateProductRequest request) {
        ProductDetailDto created = adminService.createProduct(request);
        return new ResponseEntity<>(ApiResponse.success("Product created successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductDetailDto>> updateProduct(@PathVariable Long id,
                                                                       @Valid @RequestBody CreateProductRequest request) {
        ProductDetailDto updated = adminService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", updated));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        adminService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deactivated successfully", null));
    }

    @PutMapping("/variants/{variantId}/stock")
    public ResponseEntity<ApiResponse<ProductVariantDto>> updateVariantStock(@PathVariable Long variantId,
                                                                             @Valid @RequestBody UpdateStockRequest request) {
        ProductVariantDto updated = adminService.updateVariantStock(variantId, request.getStockQuantity());
        return ResponseEntity.ok(ApiResponse.success("Variant stock updated", updated));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        List<UserDto> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", users));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<OrderDto>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize
    ) {
        Pageable pageable = PageRequest.of(page, pageSize);
        Page<OrderDto> orders = adminService.getAllOrders(pageable);
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved", orders));
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(@PathVariable Long orderId,
                                                                   @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderDto updated = orderService.updateOrderStatus(orderId, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Order status updated", updated));
    }
}
