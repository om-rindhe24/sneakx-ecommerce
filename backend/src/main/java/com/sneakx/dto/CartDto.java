package com.sneakx.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CartDto {
    private Long id;
    private List<CartItemDto> items = new ArrayList<>();
    private Integer totalItems = 0;
    private BigDecimal subtotal = BigDecimal.ZERO;
    private BigDecimal shipping = BigDecimal.ZERO;
    private BigDecimal total = BigDecimal.ZERO;

    public CartDto() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<CartItemDto> getItems() {
        return items;
    }

    public void setItems(List<CartItemDto> items) {
        this.items = items;
    }

    public Integer getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(Integer totalItems) {
        this.totalItems = totalItems;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getShipping() {
        return shipping;
    }

    public void setShipping(BigDecimal shipping) {
        this.shipping = shipping;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }
}
