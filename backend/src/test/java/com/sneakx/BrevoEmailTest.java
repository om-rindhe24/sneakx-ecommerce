package com.sneakx;

import com.sneakx.entity.Address;
import com.sneakx.entity.Order;
import com.sneakx.entity.OrderItem;
import com.sneakx.entity.User;
import com.sneakx.service.EmailService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.client.MockRestServiceServer;

import java.math.BigDecimal;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@SpringBootTest
@ActiveProfiles("h2")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
public class BrevoEmailTest {

    @Autowired
    private EmailService emailService;

    private MockRestServiceServer mockServer;

    @BeforeEach
    void setUp() {
        mockServer = MockRestServiceServer.createServer(emailService.getRestTemplate());
        emailService.setBrevoApiKey("test-brevo-api-key-998877");
        emailService.setBrevoFromEmail("orders@sneakx.com");
    }

    @AfterEach
    void tearDown() {
        emailService.setBrevoApiKey(null);
        emailService.setBrevoFromEmail(null);
        mockServer.reset();
    }

    private Order buildMockOrder() {
        User user = new User("Rohan", "Sharma", "customer@sneakx-test.com", "Password@123", "+919876543210");

        Order order = new Order();
        order.setUser(user);
        order.setOrderNumber("SNK-BREVO-TEST-001");
        order.setStatus("CONFIRMED");
        order.setPaymentMethod("CARD");
        order.setPaymentStatus("PAID");
        order.setTotalAmount(new BigDecimal("16999.00"));
        order.setConfirmationEmailSent(false);

        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setProductName("Air Jordan 1 Retro High OG Chicago");
        item.setQuantity(1);
        item.setPrice(new BigDecimal("16999.00"));
        item.setSize(BigDecimal.valueOf(8.5));
        item.setBrand("Jordan");
        order.setItems(Collections.singletonList(item));

        Address address = new Address();
        address.setFullName("Rohan Sharma");
        address.setPhone("+91 98765 43210");
        address.setStreetAddress("Flat 402, MG Road");
        address.setCity("Bengaluru");
        address.setState("Karnataka");
        address.setPostalCode("560001");
        address.setCountry("India");
        order.setAddress(address);

        return order;
    }

    @Test
    @DisplayName("BREVO: Order confirmation dispatches via Brevo REST API when BREVO_API_KEY is present")
    void testOrderConfirmationViaBrevoApi() {
        mockServer.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("api-key", "test-brevo-api-key-998877"))
                .andExpect(header("Content-Type", MediaType.APPLICATION_JSON_VALUE))
                .andExpect(jsonPath("$.sender.email").value("orders@sneakx.com"))
                .andExpect(jsonPath("$.to[0].email").value("customer@sneakx-test.com"))
                .andExpect(jsonPath("$.to[0].name").value("Rohan Sharma"))
                .andExpect(jsonPath("$.subject").value("Order Confirmed #SNK-BREVO-TEST-001 | SneakX"))
                .andRespond(withSuccess("{\"messageId\":\"<brevo-msg-001@smtp-relay.mailin.fr>\"}", MediaType.APPLICATION_JSON));

        Order order = buildMockOrder();
        boolean result = emailService.sendOrderConfirmation(order);

        assertTrue(result, "Brevo email send should return true on 2xx response");
        assertTrue(order.getConfirmationEmailSent(), "Order confirmationEmailSent must be set to true");
        mockServer.verify();
    }

    @Test
    @DisplayName("BREVO: Newsletter welcome dispatches via Brevo REST API when BREVO_API_KEY is present")
    void testNewsletterWelcomeViaBrevoApi() {
        mockServer.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("api-key", "test-brevo-api-key-998877"))
                .andExpect(header("Content-Type", MediaType.APPLICATION_JSON_VALUE))
                .andExpect(jsonPath("$.sender.name").value("SneakX Alerts"))
                .andExpect(jsonPath("$.to[0].email").value("subscriber@sneakx-test.com"))
                .andExpect(jsonPath("$.subject").value("⚡ Welcome to SneakX VIP Drop Alerts | Early Access Unlocked"))
                .andRespond(withSuccess("{\"messageId\":\"<brevo-msg-002@smtp-relay.mailin.fr>\"}", MediaType.APPLICATION_JSON));

        boolean result = emailService.sendNewsletterWelcome("subscriber@sneakx-test.com");

        assertTrue(result, "Brevo newsletter welcome should return true on 2xx response");
        mockServer.verify();
    }

    @Test
    @DisplayName("BREVO: Graceful fallback when Brevo API returns server error")
    void testBrevoApiFailureFallsBackGracefully() {
        mockServer.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withServerError());

        Order order = buildMockOrder();
        order.setOrderNumber("SNK-BREVO-FAIL-001");
        boolean result = emailService.sendOrderConfirmation(order);

        // When Brevo fails and SMTP is not configured in H2 test profile, it logs fallback receipt safely
        assertFalse(order.getConfirmationEmailSent(), "confirmationEmailSent should remain false on failed send");
        mockServer.verify();
    }
}
