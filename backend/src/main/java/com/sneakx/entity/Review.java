package com.sneakx.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "reviews", indexes = {
    @Index(name = "idx_reviews_product_id", columnList = "product_id")
})
public class Review extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer rating;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String comment;

    @Column(name = "is_verified_purchase")
    private Boolean isVerifiedPurchase = true;

    public Review() {}

    public Review(User user, Product product, Integer rating, String title, String comment, Boolean isVerifiedPurchase) {
        this.user = user;
        this.product = product;
        this.rating = rating;
        this.title = title;
        this.comment = comment;
        this.isVerifiedPurchase = isVerifiedPurchase;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Boolean getIsVerifiedPurchase() {
        return isVerifiedPurchase;
    }

    public void setIsVerifiedPurchase(Boolean isVerifiedPurchase) {
        this.isVerifiedPurchase = isVerifiedPurchase;
    }
}
