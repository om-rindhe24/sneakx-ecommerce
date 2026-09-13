package com.sneakx.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "wishlists")
public class Wishlist extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @OneToMany(mappedBy = "wishlist", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<WishlistItem> items = new ArrayList<>();

    public Wishlist() {}

    public Wishlist(User user) {
        this.user = user;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<WishlistItem> getItems() {
        return items;
    }

    public void setItems(List<WishlistItem> items) {
        this.items = items;
    }

    public void addItem(WishlistItem item) {
        items.add(item);
        item.setWishlist(this);
    }

    public void removeItem(WishlistItem item) {
        items.remove(item);
        item.setWishlist(null);
    }
}
