package com.sneakx;

import com.sneakx.controller.NewsletterController;
import com.sneakx.dto.NewsletterRequest;
import com.sneakx.entity.NewsletterSubscriber;
import com.sneakx.repository.NewsletterSubscriberRepository;
import com.sneakx.service.EmailService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("h2")
@Transactional
public class NewsletterSubscriberTest {

    @Autowired
    private NewsletterController newsletterController;

    @Autowired
    private NewsletterSubscriberRepository subscriberRepository;

    @Autowired
    private EmailService emailService;

    @Test
    @DisplayName("CASE 1: Invalid email format is rejected with 400 Bad Request")
    void testInvalidEmailRejected() {
        ResponseEntity<?> respNull = newsletterController.subscribe(null);
        assertEquals(HttpStatus.BAD_REQUEST, respNull.getStatusCode());

        ResponseEntity<?> respEmpty = newsletterController.subscribe(new NewsletterRequest(""));
        assertEquals(HttpStatus.BAD_REQUEST, respEmpty.getStatusCode());

        ResponseEntity<?> respNoDomain = newsletterController.subscribe(new NewsletterRequest("invaliduser@"));
        assertEquals(HttpStatus.BAD_REQUEST, respNoDomain.getStatusCode());
    }

    @Test
    @DisplayName("CASE 2: Valid email is successfully subscribed and persisted")
    void testValidEmailSubscribed() {
        String testEmail = "droptest" + System.currentTimeMillis() + "@sneakx.com";
        ResponseEntity<?> response = newsletterController.subscribe(new NewsletterRequest(testEmail));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(subscriberRepository.existsByEmailIgnoreCase(testEmail));

        NewsletterSubscriber sub = subscriberRepository.findByEmailIgnoreCase(testEmail).orElse(null);
        assertNotNull(sub);
        assertTrue(sub.getActive());
        assertNotNull(sub.getSubscribedAt());
    }

    @Test
    @DisplayName("CASE 3: Duplicate subscription is handled gracefully without duplicates")
    void testDuplicateSubscriptionHandled() {
        String testEmail = "duplicate" + System.currentTimeMillis() + "@sneakx.com";

        ResponseEntity<?> first = newsletterController.subscribe(new NewsletterRequest(testEmail));
        assertEquals(HttpStatus.OK, first.getStatusCode());

        ResponseEntity<?> second = newsletterController.subscribe(new NewsletterRequest(testEmail));
        assertEquals(HttpStatus.OK, second.getStatusCode());

        long count = subscriberRepository.findAll().stream()
                .filter(s -> s.getEmail().equalsIgnoreCase(testEmail))
                .count();
        assertEquals(1, count);
    }
}
