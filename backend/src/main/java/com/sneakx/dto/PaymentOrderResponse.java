package com.sneakx.dto;

import java.math.BigDecimal;

public class PaymentOrderResponse {

    private String orderId;
    private BigDecimal amount;
    private Long amountInPaise;
    private String currency;
    private String keyId;

    public PaymentOrderResponse() {}

    public PaymentOrderResponse(String orderId, BigDecimal amount, Long amountInPaise, String currency, String keyId) {
        this.orderId = orderId;
        this.amount = amount;
        this.amountInPaise = amountInPaise;
        this.currency = currency;
        this.keyId = keyId;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Long getAmountInPaise() {
        return amountInPaise;
    }

    public void setAmountInPaise(Long amountInPaise) {
        this.amountInPaise = amountInPaise;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getKeyId() {
        return keyId;
    }

    public void setKeyId(String keyId) {
        this.keyId = keyId;
    }
}
