package com.sneakx.controller;

import com.sneakx.dto.AddressDto;
import com.sneakx.dto.ApiResponse;
import com.sneakx.dto.CreateAddressRequest;
import com.sneakx.security.UserPrincipal;
import com.sneakx.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    /**
     * GET /api/addresses — list current authenticated user's saved addresses
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressDto>>> getUserAddresses(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<AddressDto> addresses = addressService.getUserAddresses(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Saved addresses retrieved successfully", addresses));
    }

    /**
     * POST /api/addresses — add a new address (optionally marked as default)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<AddressDto>> createAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateAddressRequest request) {
        AddressDto created = addressService.createAddress(principal.getId(), request);
        return new ResponseEntity<>(ApiResponse.success("Address added successfully", created), HttpStatus.CREATED);
    }

    /**
     * PUT /api/addresses/{id} — edit an existing address (verifies ownership)
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressDto>> updateAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody CreateAddressRequest request) {
        AddressDto updated = addressService.updateAddress(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", updated));
    }

    /**
     * DELETE /api/addresses/{id} — delete an address (verifies ownership)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        addressService.deleteAddress(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", null));
    }

    /**
     * PATCH /api/addresses/{id}/default — mark an address as the default
     */
    @PatchMapping("/{id}/default")
    public ResponseEntity<ApiResponse<AddressDto>> setDefaultAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        AddressDto updated = addressService.setDefaultAddress(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Default address updated successfully", updated));
    }
}
