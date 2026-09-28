package com.sneakx.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class ValidateCouponRequest {

    @NotBlank(message = "Coupon code is required")
    private String code;

    // Optional cart subtotal override for guest preview or validation
    private BigDecimal subtotal;

    public ValidateCouponRequest() {}

    public ValidateCouponRequest(String code) {
        this.code = code;
    }

    public ValidateCouponRequest(String code, BigDecimal subtotal) {
        this.code = code;
        this.subtotal = subtotal;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
}
