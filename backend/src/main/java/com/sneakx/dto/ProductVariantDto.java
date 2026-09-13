package com.sneakx.dto;

import java.math.BigDecimal;

public class ProductVariantDto {
    private Long id;
    private BigDecimal size;
    private String sku;
    private Integer stockQuantity;
    private BigDecimal priceAdjustment;
    private BigDecimal effectivePrice;

    public ProductVariantDto() {}

    public ProductVariantDto(Long id, BigDecimal size, String sku, Integer stockQuantity, BigDecimal priceAdjustment, BigDecimal effectivePrice) {
        this.id = id;
        this.size = size;
        this.sku = sku;
        this.stockQuantity = stockQuantity;
        this.priceAdjustment = priceAdjustment;
        this.effectivePrice = effectivePrice;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getSize() {
        return size;
    }

    public void setSize(BigDecimal size) {
        this.size = size;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public BigDecimal getPriceAdjustment() {
        return priceAdjustment;
    }

    public void setPriceAdjustment(BigDecimal priceAdjustment) {
        this.priceAdjustment = priceAdjustment;
    }

    public BigDecimal getEffectivePrice() {
        return effectivePrice;
    }

    public void setEffectivePrice(BigDecimal effectivePrice) {
        this.effectivePrice = effectivePrice;
    }
}
