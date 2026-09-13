package com.sneakx.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "newsletter_subscribers")
public class NewsletterSubscriber extends BaseEntity {

    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @Column(name = "subscribed_at", nullable = false)
    private LocalDateTime subscribedAt;

    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

    public NewsletterSubscriber() {
        this.subscribedAt = LocalDateTime.now();
    }

    public NewsletterSubscriber(String email) {
        this.email = email;
        this.subscribedAt = LocalDateTime.now();
        this.active = true;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getSubscribedAt() {
        return subscribedAt;
    }

    public void setSubscribedAt(LocalDateTime subscribedAt) {
        this.subscribedAt = subscribedAt;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
