package com.sneakx.dto;

import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

public class CreatePaymentOrderRequest {

    @DecimalMin(value = "1.0", message = "Amount must be at least ₹1")
    private BigDecimal amount;

    private String couponCode;

    public CreatePaymentOrderRequest() {}

    public CreatePaymentOrderRequest(BigDecimal amount) {
        this.amount = amount;
    }

    public CreatePaymentOrderRequest(BigDecimal amount, String couponCode) {
        this.amount = amount;
        this.couponCode = couponCode;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }
}
