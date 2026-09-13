package com.sneakx.controller;

import com.sneakx.dto.NewsletterRequest;
import com.sneakx.entity.NewsletterSubscriber;
import com.sneakx.repository.NewsletterSubscriberRepository;
import com.sneakx.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/newsletter")
public class NewsletterController {

    private static final Logger log = LoggerFactory.getLogger(NewsletterController.class);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private final NewsletterSubscriberRepository subscriberRepository;
    private final EmailService emailService;

    public NewsletterController(NewsletterSubscriberRepository subscriberRepository, EmailService emailService) {
        this.subscriberRepository = subscriberRepository;
        this.emailService = emailService;
    }

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody(required = false) NewsletterRequest request) {
        String email = request != null ? request.getEmail() : null;

        if (email == null || email.trim().isEmpty() || !EMAIL_PATTERN.matcher(email.trim()).matches()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Please enter a valid email address."
            ));
        }

        String cleanEmail = email.trim().toLowerCase();

        // 1. Check if already subscribed
        if (subscriberRepository.existsByEmailIgnoreCase(cleanEmail)) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "You're already subscribed to SneakX VIP Drop Alerts!"
            ));
        }

        // 2. Persist new subscriber
        NewsletterSubscriber subscriber = new NewsletterSubscriber(cleanEmail);
        subscriberRepository.save(subscriber);
        log.info("[NEWSLETTER] New subscriber registered: {}", cleanEmail);

        // 3. Dispatch VIP welcome email asynchronously so user gets instant response
        CompletableFuture.runAsync(() -> {
            try {
                emailService.sendNewsletterWelcome(cleanEmail);
            } catch (Exception ex) {
                log.error("[NEWSLETTER] Async email dispatch error for {}: {}", cleanEmail, ex.getMessage());
            }
        });

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Subscribed to SneakX VIP Drop Alerts! Welcome email dispatched."
        ));
    }
}
