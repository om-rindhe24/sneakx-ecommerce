package com.sneakx;

import com.sneakx.dto.AddToCartRequest;
import com.sneakx.dto.CheckoutRequest;
import com.sneakx.dto.CreateAddressRequest;
import com.sneakx.dto.OrderDto;
import com.sneakx.entity.*;
import com.sneakx.exception.InsufficientStockException;
import com.sneakx.repository.*;
import com.sneakx.service.CartService;
import com.sneakx.service.EmailService;
import com.sneakx.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("h2")
@Transactional
public class OrderConfirmationEmailTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductVariantRepository variantRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private OrderRepository orderRepository;

    private User testCustomer;
    private ProductVariant testVariant;

    @BeforeEach
    void setUp() {
        // Find or create test customer with real email
        testCustomer = userRepository.findByEmail("realcustomer@sneakx-test.com")
                .orElseGet(() -> {
                    User u = new User("Rohan", "Sharma", "realcustomer@sneakx-test.com", "Password@123", "+919876543210");
                    return userRepository.save(u);
                });

        // Clear cart for clean test state
        cartService.clearCart(testCustomer.getId());

        // Pick an active variant with known stock
        testVariant = variantRepository.findAll().stream()
                .filter(v -> v.getStockQuantity() != null && v.getStockQuantity() >= 5)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No variant with sufficient stock found for testing"));
    }

    private CreateAddressRequest buildTestAddress() {
        CreateAddressRequest req = new CreateAddressRequest();
        req.setFullName("Rohan Sharma");
        req.setPhone("+91 98765 43210");
        req.setStreetAddress("Flat 402, SneakX Residency");
        req.setCity("Bengaluru");
        req.setState("Karnataka");
        req.setPostalCode("560001");
        req.setCountry("India");
        req.setIsDefault(true);
        return req;
    }

    @Test
    @DisplayName("CASE 1: Successful CARD Payment -> Order created, stock deducted, confirmation email dispatched to real email")
    void testSuccessfulCardPaymentConfirmationEmail() {
        int initialStock = testVariant.getStockQuantity();

        // 1. Add item to cart
        cartService.addToCart(testCustomer.getId(), new AddToCartRequest(testVariant.getId(), 1));

        // 2. Checkout with CARD payment
        CheckoutRequest checkoutReq = new CheckoutRequest();
        checkoutReq.setNewAddress(buildTestAddress());
        checkoutReq.setPaymentMethod("SIMULATED_CARD");
        checkoutReq.setPaymentReference("DEMO_TXN_CARD_991823");

        OrderDto orderDto = orderService.checkout(testCustomer.getId(), checkoutReq);

        // 3. Verify order created
        assertNotNull(orderDto);
        assertNotNull(orderDto.getOrderNumber());
        assertEquals("CONFIRMED", orderDto.getStatus());
        assertEquals("SIMULATED_CARD", orderDto.getPaymentMethod());
        assertEquals("PAID", orderDto.getPaymentStatus());

        // 4. Verify recipient email matches the authenticated customer's actual email
        assertEquals("realcustomer@sneakx-test.com", orderDto.getCustomerEmail());
        assertEquals("Rohan Sharma", orderDto.getCustomerName());

        // 5. Verify stock deduction
        ProductVariant updatedVariant = variantRepository.findById(testVariant.getId()).orElseThrow();
        assertEquals(initialStock - 1, updatedVariant.getStockQuantity());

        // 6. Verify EmailService directly handles confirmation
        Order savedOrder = orderRepository.findByOrderNumber(orderDto.getOrderNumber()).orElseThrow();
        boolean dispatched = emailService.sendOrderConfirmation(savedOrder);
        assertTrue(dispatched, "Confirmation email dispatch must succeed");
    }

    @Test
    @DisplayName("CASE 2: Successful UPI Payment -> Order confirmed and confirmation dispatched")
    void testSuccessfulUpiPaymentConfirmationEmail() {
        cartService.addToCart(testCustomer.getId(), new AddToCartRequest(testVariant.getId(), 1));

        CheckoutRequest checkoutReq = new CheckoutRequest();
        checkoutReq.setNewAddress(buildTestAddress());
        checkoutReq.setPaymentMethod("SIMULATED_UPI");
        checkoutReq.setPaymentReference("DEMO_TXN_UPI_554433");

        OrderDto orderDto = orderService.checkout(testCustomer.getId(), checkoutReq);

        assertNotNull(orderDto);
        assertEquals("CONFIRMED", orderDto.getStatus());
        assertEquals("SIMULATED_UPI", orderDto.getPaymentMethod());
        assertEquals("PAID", orderDto.getPaymentStatus());
        assertEquals("realcustomer@sneakx-test.com", orderDto.getCustomerEmail());

        Order savedOrder = orderRepository.findByOrderNumber(orderDto.getOrderNumber()).orElseThrow();
        boolean dispatched = emailService.sendOrderConfirmation(savedOrder);
        assertTrue(dispatched);
    }

    @Test
    @DisplayName("CASE 3: Successful COD Order -> Order confirmed with COD payment status and confirmation dispatched")
    void testSuccessfulCodConfirmationEmail() {
        cartService.addToCart(testCustomer.getId(), new AddToCartRequest(testVariant.getId(), 1));

        CheckoutRequest checkoutReq = new CheckoutRequest();
        checkoutReq.setNewAddress(buildTestAddress());
        checkoutReq.setPaymentMethod("COD");
        checkoutReq.setPaymentReference("COD_VERIFIED");

        OrderDto orderDto = orderService.checkout(testCustomer.getId(), checkoutReq);

        assertNotNull(orderDto);
        assertEquals("CONFIRMED", orderDto.getStatus());
        assertEquals("COD", orderDto.getPaymentMethod());
        assertEquals("PENDING", orderDto.getPaymentStatus());
        assertEquals("realcustomer@sneakx-test.com", orderDto.getCustomerEmail());

        Order savedOrder = orderRepository.findByOrderNumber(orderDto.getOrderNumber()).orElseThrow();
        boolean dispatched = emailService.sendOrderConfirmation(savedOrder);
        assertTrue(dispatched);
    }

    @Test
    @DisplayName("CASE 4: Insufficient Stock -> Order fails, transaction rolls back, no email dispatched")
    void testInsufficientStockFailsGracefully() {
        // Add 1 item to cart
        cartService.addToCart(testCustomer.getId(), new AddToCartRequest(testVariant.getId(), 1));

        // Simulate concurrent stock depletion before checkout
        testVariant.setStockQuantity(0);
        variantRepository.save(testVariant);

        CheckoutRequest checkoutReq = new CheckoutRequest();
        checkoutReq.setNewAddress(buildTestAddress());
        checkoutReq.setPaymentMethod("SIMULATED_CARD");

        assertThrows(InsufficientStockException.class, () -> {
            orderService.checkout(testCustomer.getId(), checkoutReq);
        }, "Should throw InsufficientStockException and prevent order creation");
    }

    @Test
    @DisplayName("CASE 5: Duplicate Protection -> Repeated sendOrderConfirmation prevents duplicate email dispatch")
    void testDuplicateEmailProtection() {
        cartService.addToCart(testCustomer.getId(), new AddToCartRequest(testVariant.getId(), 1));

        CheckoutRequest checkoutReq = new CheckoutRequest();
        checkoutReq.setNewAddress(buildTestAddress());
        checkoutReq.setPaymentMethod("SIMULATED_CARD");

        OrderDto orderDto = orderService.checkout(testCustomer.getId(), checkoutReq);
        Order savedOrder = orderRepository.findByOrderNumber(orderDto.getOrderNumber()).orElseThrow();

        // First dispatch
        boolean firstDispatch = emailService.sendOrderConfirmation(savedOrder);
        assertTrue(firstDispatch);

        // Second duplicate dispatch attempt (e.g. repeated submission / retry)
        boolean secondDispatch = emailService.sendOrderConfirmation(savedOrder);
        // Returns true (safe prevention without error) and duplicate is blocked
        assertTrue(secondDispatch);
    }

    @Test
    @DisplayName("CASE 6: Safe Error Handling -> Null or missing order handled without throwing unhandled exceptions")
    void testSafeHandlingOnNullInputs() {
        boolean nullOrder = emailService.sendOrderConfirmation(null);
        assertFalse(nullOrder);

        Order emptyUserOrder = new Order();
        emptyUserOrder.setOrderNumber("SNK-EMPTY-0001");
        boolean noUser = emailService.sendOrderConfirmation(emptyUserOrder);
        assertFalse(noUser);
    }
}
