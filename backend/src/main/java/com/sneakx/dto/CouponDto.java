package com.sneakx.dto;

import com.sneakx.entity.Coupon;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CouponDto {

    private Long id;
    private String code;
    private String description;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minOrderAmount;
    private LocalDateTime expiryDate;
    private Integer totalUsageLimit;
    private Integer usageCount;
    private Boolean onePerUser;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public CouponDto() {}

    public static CouponDto fromEntity(Coupon coupon) {
        if (coupon == null) return null;
        CouponDto dto = new CouponDto();
        dto.setId(coupon.getId());
        dto.setCode(coupon.getCode());
        dto.setDescription(coupon.getDescription());
        dto.setDiscountType(coupon.getDiscountType());
        dto.setDiscountValue(coupon.getDiscountValue());
        dto.setMaxDiscountAmount(coupon.getMaxDiscountAmount());
        dto.setMinOrderAmount(coupon.getMinOrderAmount());
        dto.setExpiryDate(coupon.getExpiryDate());
        dto.setTotalUsageLimit(coupon.getTotalUsageLimit());
        dto.setUsageCount(coupon.getUsageCount());
        dto.setOnePerUser(coupon.getOnePerUser());
        dto.setIsActive(coupon.getIsActive());
        dto.setCreatedAt(coupon.getCreatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
        return usageCount;
    }

    public void setUsageCount(Integer usageCount) {
        this.usageCount = usageCount;
    }

    public Boolean getOnePerUser() {
        return onePerUser;
    }

    public void setOnePerUser(Boolean onePerUser) {
        this.onePerUser = onePerUser;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
