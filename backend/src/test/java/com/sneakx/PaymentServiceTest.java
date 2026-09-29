package com.sneakx;

import com.sneakx.dto.AddToCartRequest;
import com.sneakx.dto.CreateAddressRequest;
import com.sneakx.dto.OrderDto;
import com.sneakx.dto.PaymentVerificationRequest;
import com.sneakx.entity.Address;
import com.sneakx.entity.Order;
import com.sneakx.entity.Product;
import com.sneakx.entity.ProductVariant;
import com.sneakx.entity.User;
import com.sneakx.exception.BadRequestException;
import com.sneakx.exception.UnauthorizedException;
import com.sneakx.repository.AddressRepository;
import com.sneakx.repository.CartRepository;
import com.sneakx.repository.OrderRepository;
import com.sneakx.repository.ProductRepository;
import com.sneakx.repository.ProductVariantRepository;
import com.sneakx.repository.UserRepository;
import com.sneakx.service.CartService;
import com.sneakx.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("h2")
@Transactional
public class PaymentServiceTest {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository variantRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private AddressRepository addressRepository;

    private User testCustomer;
    private ProductVariant testVariant;
    private final String mockSecret = "sample_test_secret_for_unit_tests";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(paymentService, "keySecret", mockSecret);
        ReflectionTestUtils.setField(paymentService, "keyId", "rzp_test_sample123");

        testCustomer = userRepository.findByEmail("paymentcustomer@sneakx-test.com")
                .orElseGet(() -> {
                    User u = new User("Payment", "Tester", "paymentcustomer@sneakx-test.com", "Password@123", "+919876543210");
                    return userRepository.save(u);
                });

        Product product = productRepository.findAll().stream().findFirst()
                .orElseGet(() -> {
                    Product p = new Product();
                    p.setName("Payment Test Sneaker");
                    p.setSlug("payment-test-sneaker");
                    p.setBasePrice(new BigDecimal("12999.00"));
                    return productRepository.save(p);
                });

        testVariant = variantRepository.findAll().stream()
                .filter(v -> v.getProduct().getId().equals(product.getId()) && v.getStockQuantity() > 2)
                .findFirst()
                .orElseGet(() -> {
                    ProductVariant v = new ProductVariant();
                    v.setProduct(product);
                    v.setSize(new BigDecimal("9.0"));
                    v.setSku("PAY-TEST-90");
                    v.setStockQuantity(10);
                    v.setPriceAdjustment(BigDecimal.ZERO);
                    return variantRepository.save(v);
                });

        cartService.clearCart(testCustomer.getId());
    }

    private String generateSignature(String orderId, String paymentId, String secret) {
        try {
            String data = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : rawHmac) {
                String hexByte = Integer.toHexString(0xff & b);
                if (hexByte.length() == 1) {
                    hex.append('0');
                }
                hex.append(hexByte);
            }
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    @DisplayName("Valid Razorpay signature confirms order and marks payment as PAID")
    void testValidSignatureConfirmsOrder() {
        // Add item to cart
        cartService.addToCart(testCustomer.getId(), new AddToCartRequest(testVariant.getId(), 1));

        int initialStock = testVariant.getStockQuantity();

        String orderId = "order_test_razorpay_001";
        String paymentId = "pay_test_razorpay_001";
        String signature = generateSignature(orderId, paymentId, mockSecret);

        CreateAddressRequest address = new CreateAddressRequest();
        address.setFullName("Payment Tester");
        address.setPhone("+919876543210");
        address.setStreetAddress("123 Tech Park");
        address.setCity("Bengaluru");
        address.setState("Karnataka");
        address.setPostalCode("560001");
        address.setCountry("India");

        PaymentVerificationRequest req = new PaymentVerificationRequest();
        req.setRazorpayOrderId(orderId);
        req.setRazorpayPaymentId(paymentId);
        req.setRazorpaySignature(signature);
        req.setNewAddress(address);

        OrderDto confirmedOrder = paymentService.verifyPaymentAndConfirmOrder(testCustomer.getId(), req);

        assertNotNull(confirmedOrder);
        assertNotNull(confirmedOrder.getOrderNumber());
        assertEquals("CONFIRMED", confirmedOrder.getStatus());
        assertEquals("PAID", confirmedOrder.getPaymentStatus());
        assertEquals("RAZORPAY", confirmedOrder.getPaymentMethod());
        assertEquals(paymentId, confirmedOrder.getPaymentReference());

        // Verify stock deducted atomically
        ProductVariant updatedVariant = variantRepository.findById(testVariant.getId()).orElseThrow();
        assertEquals(initialStock - 1, updatedVariant.getStockQuantity());
    }

    @Test
    @DisplayName("Tampered or invalid signature is rejected with BadRequestException and order is not confirmed")
    void testInvalidSignatureThrowsBadRequest() {
        cartService.addToCart(testCustomer.getId(), new AddToCartRequest(testVariant.getId(), 1));
        int initialStock = testVariant.getStockQuantity();

        PaymentVerificationRequest req = new PaymentVerificationRequest();
        req.setRazorpayOrderId("order_test_fake_002");
        req.setRazorpayPaymentId("pay_test_fake_002");
        req.setRazorpaySignature("invalid_forged_signature_hex");

        assertThrows(BadRequestException.class, () -> {
            paymentService.verifyPaymentAndConfirmOrder(testCustomer.getId(), req);
        });

        // Verify stock untouched
        ProductVariant updatedVariant = variantRepository.findById(testVariant.getId()).orElseThrow();
        assertEquals(initialStock, updatedVariant.getStockQuantity());
    }

    @Test
    @DisplayName("SEC-01: Verifying payment for another user's order throws UnauthorizedException and does not modify order")
    void testVerifyPaymentForOtherUserOrderThrowsUnauthorized() {
        // Create an order belonging to another user (victim)
        User victim = userRepository.findByEmail("victim-user@sneakx-test.com")
                .orElseGet(() -> userRepository.save(new User("Victim", "User", "victim-user@sneakx-test.com", "Password@123", "+919876543211")));

        Address victimAddress = new Address();
        victimAddress.setUser(victim);
        victimAddress.setFullName("Victim User");
        victimAddress.setPhone("+919876543211");
        victimAddress.setStreetAddress("456 Market St");
        victimAddress.setCity("Mumbai");
        victimAddress.setState("Maharashtra");
        victimAddress.setPostalCode("400001");
        victimAddress.setCountry("India");
        victimAddress = addressRepository.save(victimAddress);

        Order victimOrder = new Order();
        victimOrder.setUser(victim);
        victimOrder.setAddress(victimAddress);
        victimOrder.setOrderNumber("SNK-VICTIM-001");
        victimOrder.setStatus("PENDING");
        victimOrder.setPaymentStatus("PENDING");
        victimOrder.setTotalAmount(new BigDecimal("12999.00"));
        victimOrder = orderRepository.save(victimOrder);

        String orderId = "order_test_razorpay_sec01";
        String paymentId = "pay_test_razorpay_sec01";
        String signature = generateSignature(orderId, paymentId, mockSecret);

        PaymentVerificationRequest req = new PaymentVerificationRequest();
        req.setRazorpayOrderId(orderId);
        req.setRazorpayPaymentId(paymentId);
        req.setRazorpaySignature(signature);
        req.setOrderId(victimOrder.getId());

        // Attacker (testCustomer) attempts to verify/pay victim's order
        Long attackerUserId = testCustomer.getId();
        assertThrows(UnauthorizedException.class, () -> {
            paymentService.verifyPaymentAndConfirmOrder(attackerUserId, req);
        });

        // Verify victim's order was NOT modified
        Order persistedOrder = orderRepository.findById(victimOrder.getId()).orElseThrow();
        assertEquals("PENDING", persistedOrder.getStatus());
        assertEquals("PENDING", persistedOrder.getPaymentStatus());
        assertNull(persistedOrder.getPaymentReference());
    }
}
