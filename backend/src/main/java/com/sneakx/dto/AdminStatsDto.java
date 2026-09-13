package com.sneakx.dto;

import java.math.BigDecimal;
import java.util.List;

public class AdminStatsDto {
    private Long totalProducts;
    private Long totalUsers;
    private Long totalOrders;
    private Long activeOrders;
    private BigDecimal totalRevenue;
    private List<ProductVariantDto> lowStockAlerts;

    public AdminStatsDto() {}

    public Long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(Long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public Long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(Long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public Long getActiveOrders() {
        return activeOrders;
    }

    public void setActiveOrders(Long activeOrders) {
        this.activeOrders = activeOrders;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public List<ProductVariantDto> getLowStockAlerts() {
        return lowStockAlerts;
    }

    public void setLowStockAlerts(List<ProductVariantDto> lowStockAlerts) {
        this.lowStockAlerts = lowStockAlerts;
    }
}
