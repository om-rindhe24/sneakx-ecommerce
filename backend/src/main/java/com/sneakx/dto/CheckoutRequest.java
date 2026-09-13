package com.sneakx.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CheckoutRequest {

    private Long addressId;

    // Optional inline address creation if addressId is null
    private CreateAddressRequest newAddress;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod = "COD"; // COD, SIMULATED_CARD, SIMULATED_UPI

    private String paymentReference;

    public CheckoutRequest() {}

    public Long getAddressId() {
        return addressId;
    }

    public void setAddressId(Long addressId) {
        this.addressId = addressId;
    }

    public CreateAddressRequest getNewAddress() {
        return newAddress;
    }

    public void setNewAddress(CreateAddressRequest newAddress) {
        this.newAddress = newAddress;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }
}
