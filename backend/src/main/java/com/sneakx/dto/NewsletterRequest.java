package com.sneakx.dto;

public class NewsletterRequest {
    private String email;

    public NewsletterRequest() {}

    public NewsletterRequest(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
