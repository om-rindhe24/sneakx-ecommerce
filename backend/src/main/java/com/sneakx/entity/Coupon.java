package com.sneakx.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons", indexes = {
    @Index(name = "idx_coupons_code", columnList = "code", unique = true),
    @Index(name = "idx_coupons_is_active", columnList = "is_active")
})
public class Coupon extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(length = 255)
    private String description;

    @Column(name = "discount_type", nullable = false, length = 20)
    private String discountType = "PERCENTAGE"; // "PERCENTAGE" or "FLAT"

    @Column(name = "discount_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "max_discount_amount", precision = 10, scale = 2)
    private BigDecimal maxDiscountAmount;

    @Column(name = "min_order_amount", precision = 10, scale = 2)
    private BigDecimal minOrderAmount;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @Column(name = "total_usage_limit")
    private Integer totalUsageLimit;

    @Column(name = "usage_count", nullable = false)
    private Integer usageCount = 0;

    @Column(name = "one_per_user", nullable = false)
    private Boolean onePerUser = true;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    public Coupon() {}

    public Coupon(String code, String description, String discountType, BigDecimal discountValue) {
        this.code = code != null ? code.trim().toUpperCase() : null;
        this.description = description;
        this.discountType = discountType;
        this.discountValue = discountValue;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code != null ? code.trim().toUpperCase() : null;
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

    public BigDecimal getMaxDiscountAmount() {
        return maxDiscountAmount;
    }

    public void setMaxDiscountAmount(BigDecimal maxDiscountAmount) {
        this.maxDiscountAmount = maxDiscountAmount;
    }

    public BigDecimal getMinOrderAmount() {
        return minOrderAmount;
    }

    public void setMinOrderAmount(BigDecimal minOrderAmount) {
        this.minOrderAmount = minOrderAmount;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Integer getTotalUsageLimit() {
        return totalUsageLimit;
    }

    public void setTotalUsageLimit(Integer totalUsageLimit) {
        this.totalUsageLimit = totalUsageLimit;
    }

    public Integer getUsageCount() {
        return usageCount != null ? usageCount : 0;
    }

    public void setUsageCount(Integer usageCount) {
        this.usageCount = usageCount != null ? usageCount : 0;
    }

    public Boolean getOnePerUser() {
        return onePerUser != null && onePerUser;
    }

    public void setOnePerUser(Boolean onePerUser) {
        this.onePerUser = onePerUser;
    }

    public Boolean getIsActive() {
        return isActive != null && isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
