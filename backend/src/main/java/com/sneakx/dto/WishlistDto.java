package com.sneakx.dto;

import java.util.ArrayList;
import java.util.List;

public class WishlistDto {
    private Long id;
    private List<ProductDto> items = new ArrayList<>();
    private Integer totalItems = 0;

    public WishlistDto() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<ProductDto> getItems() {
        return items;
    }

    public void setItems(List<ProductDto> items) {
        this.items = items;
    }

    public Integer getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(Integer totalItems) {
        this.totalItems = totalItems;
    }
}
