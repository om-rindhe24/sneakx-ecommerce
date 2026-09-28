package com.sneakx.dto;

import java.math.BigDecimal;

public class CouponValidationResponse {

    private boolean valid;
    private String code;
    private String description;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal discountAmount;
    private BigDecimal subtotal;
    private BigDecimal newTotal;
    private BigDecimal shipping;

    public CouponValidationResponse() {}

    public CouponValidationResponse(boolean valid, String code, String description,
                                  String discountType, BigDecimal discountValue,
                                  BigDecimal discountAmount, BigDecimal subtotal,
                                  BigDecimal newTotal, BigDecimal shipping) {
        this.valid = valid;
        this.code = code;
        this.description = description;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.discountAmount = discountAmount;
        this.subtotal = subtotal;
        this.newTotal = newTotal;
        this.shipping = shipping;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDiscountType() {
        return discountType;
    }

    public void setDiscountType(String discountType) {
        this.discountType = discountType;
    }

    public BigDecimal getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getNewTotal() {
        return newTotal;
    }

    public void setNewTotal(BigDecimal newTotal) {
        this.newTotal = newTotal;
    }

    public BigDecimal getShipping() {
        return shipping;
    }

    public void setShipping(BigDecimal shipping) {
        this.shipping = shipping;
    }
}
