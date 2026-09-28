package com.sneakx;

import com.sneakx.dto.OrderDto;
import com.sneakx.entity.*;
import com.sneakx.exception.BadRequestException;
import com.sneakx.exception.UnauthorizedException;
import com.sneakx.repository.*;
import com.sneakx.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("h2")
@Transactional
public class OrderCancellationTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository variantRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private CouponRepository couponRepository;

    private User customerA;
    private User customerB;
    private Address addressA;
    private Product product;
    private ProductVariant variant1;
    private ProductVariant variant2;
    private Coupon testCoupon;

    @BeforeEach
    void setUp() {
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_USER")));

        long ts = System.currentTimeMillis();
        customerA = new User("Rohan", "Mehra", "rohan.cancel." + ts + "@sneakx.com", "hash", "+91 99999 11111");
        customerA.setRoles(new HashSet<>(Collections.singletonList(userRole)));
        customerA = userRepository.save(customerA);

        customerB = new User("Vikram", "Sen", "vikram.cancel." + ts + "@sneakx.com", "hash", "+91 88888 22222");
        customerB.setRoles(new HashSet<>(Collections.singletonList(userRole)));
        customerB = userRepository.save(customerB);

        addressA = new Address();
        addressA.setUser(customerA);
        addressA.setFullName("Rohan Mehra");
        addressA.setPhone("+91 99999 11111");
        addressA.setStreetAddress("Flat 4B, Sky Towers");
        addressA.setCity("Mumbai");
        addressA.setState("Maharashtra");
        addressA.setPostalCode("400001");
        addressA.setCountry("India");
        addressA.setIsDefault(true);
        addressA = addressRepository.save(addressA);

        Brand brand = brandRepository.findAll().stream().findFirst()
                .orElseGet(() -> brandRepository.save(new Brand("Nike", "nike-" + ts, "Nike Sneakers")));
        Category category = categoryRepository.findAll().stream().findFirst()
                .orElseGet(() -> categoryRepository.save(new Category("Sneakers", "sneakers-" + ts, "Sneakers")));

        product = new Product();
        product.setName("Air Jordan 1 High OG");
        product.setSlug("air-jordan-1-cancel-" + ts);
        product.setBrand(brand);
        product.setCategory(category);
        product.setDescription("Iconic Jordan high-top");
        product.setBasePrice(new BigDecimal("16995.00"));
        product.setColorway("Chicago Red/White/Black");
        product.setGender("Men");
        product.setIsActive(true);
        product = productRepository.save(product);

        variant1 = new ProductVariant(product, new BigDecimal("9.0"), "SKU-AJ1-UK9-" + ts, 10, BigDecimal.ZERO);
        variant1 = variantRepository.save(variant1);

        variant2 = new ProductVariant(product, new BigDecimal("10.0"), "SKU-AJ1-UK10-" + ts, 5, BigDecimal.ZERO);
        variant2 = variantRepository.save(variant2);

        testCoupon = new Coupon();
        testCoupon.setCode("CANCEL10");
        testCoupon.setDescription("10% off test coupon");
        testCoupon.setDiscountType("PERCENTAGE");
        testCoupon.setDiscountValue(new BigDecimal("10.00"));
        testCoupon.setMaxDiscountAmount(new BigDecimal("5000.00"));
        testCoupon.setMinOrderAmount(BigDecimal.ZERO);
        testCoupon.setTotalUsageLimit(50);
        testCoupon.setUsageCount(1);
        testCoupon.setOnePerUser(true);
        testCoupon.setIsActive(true);
        testCoupon.setExpiryDate(LocalDateTime.now().plusDays(30));
        testCoupon = couponRepository.save(testCoupon);
    }

    private Order createTestOrder(User user, String status, String paymentMethod, String paymentStatus, String couponCode) {
        Order order = new Order();
        order.setOrderNumber("SNK-TEST-" + System.currentTimeMillis() % 1000000);
        order.setUser(user);
        order.setAddress(addressA);
        order.setStatus(status);
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus(paymentStatus);
        order.setSubtotal(new BigDecimal("33990.00"));
        order.setTotalAmount(new BigDecimal("33990.00"));
        order.setCouponCode(couponCode);
        if (couponCode != null) {
            order.setDiscountAmount(new BigDecimal("3399.00"));
            order.setTotalAmount(new BigDecimal("30591.00"));
        } else {
            order.setDiscountAmount(BigDecimal.ZERO);
        }
        order.setPaymentReference("DEMO_PAY_" + System.currentTimeMillis());

        Order saved = orderRepository.save(order);

        List<OrderItem> items = new ArrayList<>();
        OrderItem item1 = new OrderItem();
        item1.setOrder(saved);
        item1.setVariant(variant1);
        item1.setProductName(product.getName());
        item1.setBrand("Nike");
        item1.setSize(variant1.getSize());
        item1.setSku(variant1.getSku());
        item1.setColorway("Chicago");
        item1.setImageUrl(null);
        item1.setPrice(variant1.getEffectivePrice());
        item1.setQuantity(2);
        item1 = orderItemRepository.save(item1);
        items.add(item1);

        OrderItem item2 = new OrderItem();
        item2.setOrder(saved);
        item2.setVariant(variant2);
        item2.setProductName(product.getName());
        item2.setBrand("Nike");
        item2.setSize(variant2.getSize());
        item2.setSku(variant2.getSku());
        item2.setColorway("Chicago");
        item2.setImageUrl(null);
        item2.setPrice(variant2.getEffectivePrice());
        item2.setQuantity(1);
        item2 = orderItemRepository.save(item2);
        items.add(item2);

        saved.setItems(items);
        return orderRepository.save(saved);
    }

    @Test
    @DisplayName("1. Cancelling a valid order sets CANCELLED status, reason, and cancelledAt")
    void testCancelValidOrder() {
        Order order = createTestOrder(customerA, "CONFIRMED", "COD", "PENDING", null);

        OrderDto result = orderService.cancelOrder(customerA.getId(), order.getId(), "Found a better price");

        assertNotNull(result);
        assertEquals("CANCELLED", result.getStatus());
        assertEquals("Found a better price", result.getCancellationReason());
        assertNotNull(result.getCancelledAt());
    }

    @Test
    @DisplayName("2. Stock restoration adds cancelled quantities back to product variants")
    void testStockRestoration() {
        // Initial stock: variant1 = 10, variant2 = 5
        assertEquals(10, variantRepository.findById(variant1.getId()).get().getStockQuantity());
        assertEquals(5, variantRepository.findById(variant2.getId()).get().getStockQuantity());

        // Order has 2 of variant1, 1 of variant2
        Order order = createTestOrder(customerA, "CONFIRMED", "COD", "PENDING", null);

        orderService.cancelOrder(customerA.getId(), order.getId(), "Ordered by mistake");

        // Stock after cancellation: variant1 should be 10 + 2 = 12, variant2 should be 5 + 1 = 6
        ProductVariant updatedV1 = variantRepository.findById(variant1.getId()).get();
        ProductVariant updatedV2 = variantRepository.findById(variant2.getId()).get();
        assertEquals(12, updatedV1.getStockQuantity());
        assertEquals(6, updatedV2.getStockQuantity());
    }

    @Test
    @DisplayName("3. Double-cancel is rejected and does not restore stock twice (idempotency)")
    void testDoubleCancelIdempotency() {
        Order order = createTestOrder(customerA, "CONFIRMED", "COD", "PENDING", null);

        // First cancellation succeeds
        orderService.cancelOrder(customerA.getId(), order.getId(), "First cancel");
        assertEquals(12, variantRepository.findById(variant1.getId()).get().getStockQuantity());

        // Second cancellation attempt must be rejected with BadRequestException
        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                orderService.cancelOrder(customerA.getId(), order.getId(), "Duplicate cancel")
        );
        assertTrue(ex.getMessage().toLowerCase().contains("already cancelled"));

        // Stock MUST remain 12, NOT incremented to 14
        assertEquals(12, variantRepository.findById(variant1.getId()).get().getStockQuantity());
    }

    @Test
    @DisplayName("4. Reject cancellation of SHIPPED and DELIVERED orders")
    void testRejectCancellationOfShippedAndDeliveredOrders() {
        Order shippedOrder = createTestOrder(customerA, "SHIPPED", "COD", "PENDING", null);
        BadRequestException shippedEx = assertThrows(BadRequestException.class, () ->
                orderService.cancelOrder(customerA.getId(), shippedOrder.getId(), "Delivery too slow")
        );
        assertTrue(shippedEx.getMessage().toLowerCase().contains("shipped"));

        Order deliveredOrder = createTestOrder(customerA, "DELIVERED", "COD", "PAID", null);
        BadRequestException deliveredEx = assertThrows(BadRequestException.class, () ->
                orderService.cancelOrder(customerA.getId(), deliveredOrder.getId(), "Don't want it anymore")
        );
        assertTrue(deliveredEx.getMessage().toLowerCase().contains("delivered"));
    }

    @Test
    @DisplayName("5. User cannot cancel someone else's order (Ownership Verification)")
    void testUnauthorizedUserCannotCancel() {
        Order orderOfCustomerA = createTestOrder(customerA, "CONFIRMED", "COD", "PENDING", null);

        // Customer B attempts to cancel Customer A's order
        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () ->
                orderService.cancelOrder(customerB.getId(), orderOfCustomerA.getId(), "Malicious cancel")
        );
        assertTrue(ex.getMessage().toLowerCase().contains("permission"));
    }

    @Test
    @DisplayName("6. Coupon is freed up: usageCount decremented and one-per-user restriction released")
    void testCouponFreedUpOnCancellation() {
        int initialUsageCount = testCoupon.getUsageCount(); // 1
        Order orderWithCoupon = createTestOrder(customerA, "CONFIRMED", "COD", "PENDING", "CANCEL10");

        // Before cancellation, one-per-user check prevents re-use
        assertTrue(orderRepository.existsByUserIdAndCouponCodeIgnoreCaseAndStatusNot(
                customerA.getId(), "CANCEL10", "CANCELLED"));

        // Cancel order
        orderService.cancelOrder(customerA.getId(), orderWithCoupon.getId(), "Need to change coupon");

        // After cancellation:
        // a) One-per-user restriction is released
        assertFalse(orderRepository.existsByUserIdAndCouponCodeIgnoreCaseAndStatusNot(
                customerA.getId(), "CANCEL10", "CANCELLED"));

        // b) Total coupon usage count is decremented
        Coupon refreshedCoupon = couponRepository.findById(testCoupon.getId()).get();
        assertEquals(initialUsageCount - 1, refreshedCoupon.getUsageCount());
    }

    @Test
    @DisplayName("7. COD refund path records NO_REFUND_REQUIRED with zero refund amount")
    void testCodRefundPath() {
        Order codOrder = createTestOrder(customerA, "CONFIRMED", "COD", "PENDING", null);

        OrderDto cancelled = orderService.cancelOrder(customerA.getId(), codOrder.getId(), "Found a better price");

        assertEquals("NO_REFUND_REQUIRED", cancelled.getRefundStatus());
        assertEquals(BigDecimal.ZERO, cancelled.getRefundAmount());
        assertNull(cancelled.getRefundId());
    }

    @Test
    @DisplayName("8. Razorpay / Paid order refund path records refund amount and reference")
    void testPaidOrderRefundPath() {
        Order paidOrder = createTestOrder(customerA, "CONFIRMED", "RAZORPAY", "PAID", null);

        OrderDto cancelled = orderService.cancelOrder(customerA.getId(), paidOrder.getId(), "Ordered by mistake");

        assertEquals("PROCESSED", cancelled.getRefundStatus());
        assertEquals(new BigDecimal("33990.00"), cancelled.getRefundAmount());
        assertNotNull(cancelled.getRefundId());
        assertTrue(cancelled.getRefundId().startsWith("rfnd_"));
    }

    @Test
    @DisplayName("9. Admin cannot reactivate or change status of a CANCELLED order")
    void testAdminCannotReactivateCancelledOrder() {
        Order order = createTestOrder(customerA, "CONFIRMED", "COD", "PENDING", null);
        orderService.cancelOrder(customerA.getId(), order.getId(), "Customer changed mind");

        // Admin attempts to change CANCELLED order to CONFIRMED
        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                orderService.updateOrderStatus(order.getId(), "CONFIRMED")
        );
        assertTrue(ex.getMessage().toLowerCase().contains("cancelled orders cannot be modified"));
    }
}
