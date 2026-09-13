package com.sneakx.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "product_variants", indexes = {
    @Index(name = "idx_variants_product_id", columnList = "product_id"),
    @Index(name = "idx_variants_sku", columnList = "sku")
})
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, precision = 3, scale = 1)
    private BigDecimal size;

    @Column(nullable = false, unique = true, length = 60)
    private String sku;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Column(name = "price_adjustment", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceAdjustment = BigDecimal.ZERO;

    public ProductVariant() {}

    public ProductVariant(Product product, BigDecimal size, String sku, Integer stockQuantity, BigDecimal priceAdjustment) {
        this.product = product;
        this.size = size;
        this.sku = sku;
        this.stockQuantity = stockQuantity;
        this.priceAdjustment = priceAdjustment != null ? priceAdjustment : BigDecimal.ZERO;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
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
        if (product == null || product.getBasePrice() == null) {
            return priceAdjustment != null ? priceAdjustment : BigDecimal.ZERO;
        }
        return product.getBasePrice().add(priceAdjustment != null ? priceAdjustment : BigDecimal.ZERO);
    }
}
