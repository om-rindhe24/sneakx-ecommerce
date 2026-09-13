package com.sneakx.dto;

import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

public class CreatePaymentOrderRequest {

    @DecimalMin(value = "1.0", message = "Amount must be at least ₹1")
    private BigDecimal amount;

    public CreatePaymentOrderRequest() {}

    public CreatePaymentOrderRequest(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
