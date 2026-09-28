package com.sneakx;

import com.sneakx.dto.CouponDto;
import com.sneakx.dto.CouponValidationResponse;
import com.sneakx.dto.CreateCouponRequest;
import com.sneakx.entity.*;
import com.sneakx.exception.BadRequestException;
import com.sneakx.repository.*;
import com.sneakx.service.CouponService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("h2")
@Transactional
public class CouponServiceTest {

    @Autowired
    private CouponService couponService;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private AddressRepository addressRepository;

    private User testUser;
    private Coupon percentCoupon;
    private Coupon flatCoupon;

    @BeforeEach
    void setUp() {
        Role role = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_USER")));

        testUser = new User("Aarav", "Patel", "aarav.coupon." + System.currentTimeMillis() + "@sneakx.com", "hash", "+91 98765 43210");
        testUser.setRoles(new HashSet<>(Collections.singletonList(role)));
        testUser = userRepository.save(testUser);

        // Percentage coupon: 10% off, max ₹2,500, min order ₹3,000, usage limit 50
        percentCoupon = new Coupon();
        percentCoupon.setCode("TEST10");
        percentCoupon.setDescription("10% off test coupon");
        percentCoupon.setDiscountType("PERCENTAGE");
        percentCoupon.setDiscountValue(new BigDecimal("10.00"));
        percentCoupon.setMaxDiscountAmount(new BigDecimal("2500.00"));
        percentCoupon.setMinOrderAmount(new BigDecimal("3000.00"));
        percentCoupon.setTotalUsageLimit(50);
        percentCoupon.setUsageCount(0);
        percentCoupon.setOnePerUser(true);
        percentCoupon.setIsActive(true);
        percentCoupon.setExpiryDate(LocalDateTime.now().plusDays(30));
        percentCoupon = couponRepository.save(percentCoupon);

        // Flat coupon: ₹500 off, min order ₹2,000
        flatCoupon = new Coupon();
        flatCoupon.setCode("FLAT500TEST");
        flatCoupon.setDescription("Flat ₹500 off test coupon");
        flatCoupon.setDiscountType("FLAT");
        flatCoupon.setDiscountValue(new BigDecimal("500.00"));
        flatCoupon.setMinOrderAmount(new BigDecimal("2000.00"));
        flatCoupon.setTotalUsageLimit(100);
        flatCoupon.setUsageCount(0);
        flatCoupon.setOnePerUser(true);
        flatCoupon.setIsActive(true);
        flatCoupon.setExpiryDate(LocalDateTime.now().plusDays(30));
        flatCoupon = couponRepository.save(flatCoupon);
    }

    @Test
    @DisplayName("Should successfully validate percentage coupon and compute discount")
    void testValidatePercentageCouponSuccess() {
        BigDecimal subtotal = new BigDecimal("10000.00");
        CouponValidationResponse response = couponService.validateCoupon(testUser.getId(), "TEST10", subtotal);

        assertTrue(response.isValid());
        assertEquals("TEST10", response.getCode());
        assertEquals("PERCENTAGE", response.getDiscountType());
        // 10% of 10,000 = 1,000
        assertEquals(new BigDecimal("1000.00"), response.getDiscountAmount());
        assertEquals(new BigDecimal("9000.00"), response.getNewTotal());
    }

    @Test
    @DisplayName("Should cap percentage discount at maxDiscountAmount")
    void testPercentageDiscountCap() {
        BigDecimal subtotal = new BigDecimal("50000.00");
        // 10% would be 5,000, but cap is 2,500
        CouponValidationResponse response = couponService.validateCoupon(testUser.getId(), "TEST10", subtotal);

        assertEquals(new BigDecimal("2500.00"), response.getDiscountAmount());
        assertEquals(new BigDecimal("47500.00"), response.getNewTotal());
    }

    @Test
    @DisplayName("Should successfully validate flat amount coupon")
    void testValidateFlatCouponSuccess() {
        BigDecimal subtotal = new BigDecimal("4000.00");
        CouponValidationResponse response = couponService.validateCoupon(testUser.getId(), "FLAT500TEST", subtotal);

        assertTrue(response.isValid());
        assertEquals("FLAT", response.getDiscountType());
        assertEquals(new BigDecimal("500.00"), response.getDiscountAmount());
        // 4000 - 500 + 250 shipping (subtotal < 5000) = 3750
        assertEquals(new BigDecimal("3750.00"), response.getNewTotal());
        assertEquals(new BigDecimal("250"), response.getShipping());
    }

    @Test
    @DisplayName("Should reject non-existent or invalid coupon code")
    void testInvalidCouponCode() {
        assertThrows(BadRequestException.class, () ->
                couponService.validateCoupon(testUser.getId(), "INVALID_CODE_XYZ", new BigDecimal("5000.00"))
        );
    }

    @Test
    @DisplayName("Should reject inactive coupon code")
    void testInactiveCoupon() {
        percentCoupon.setIsActive(false);
        couponRepository.save(percentCoupon);

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                couponService.validateCoupon(testUser.getId(), "TEST10", new BigDecimal("5000.00"))
        );
        assertTrue(ex.getMessage().contains("no longer active"));
    }

    @Test
    @DisplayName("Should reject expired coupon")
    void testExpiredCoupon() {
        percentCoupon.setExpiryDate(LocalDateTime.now().minusDays(1));
        couponRepository.save(percentCoupon);

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                couponService.validateCoupon(testUser.getId(), "TEST10", new BigDecimal("5000.00"))
        );
        assertTrue(ex.getMessage().contains("expired"));
    }

    @Test
    @DisplayName("Should reject coupon when subtotal is below minOrderAmount")
    void testBelowMinimumOrderAmount() {
        // Minimum order for TEST10 is ₹3,000, testing with ₹2,000
        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                couponService.validateCoupon(testUser.getId(), "TEST10", new BigDecimal("2000.00"))
        );
        assertTrue(ex.getMessage().contains("Minimum order value"));
    }

    @Test
    @DisplayName("Should reject coupon when totalUsageLimit is reached")
    void testUsageLimitReached() {
        percentCoupon.setTotalUsageLimit(10);
        percentCoupon.setUsageCount(10);
        couponRepository.save(percentCoupon);

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                couponService.validateCoupon(testUser.getId(), "TEST10", new BigDecimal("5000.00"))
        );
        assertTrue(ex.getMessage().contains("maximum redemption limit"));
    }

    @Test
    @DisplayName("Should reject coupon if user has already used it (onePerUser)")
    void testOnePerUserEnforcement() {
        // Place an order using this coupon for this user
        Address address = new Address();
        address.setUser(testUser);
        address.setFullName("Aarav Patel");
        address.setPhone("+91 98765 43210");
        address.setStreetAddress("123 Street");
        address.setCity("Bengaluru");
        address.setState("Karnataka");
        address.setPostalCode("560001");
        address.setIsDefault(true);
        addressRepository.save(address);

        Order existingOrder = new Order();
        existingOrder.setOrderNumber("SNK-PREV-001");
        existingOrder.setUser(testUser);
        existingOrder.setAddress(address);
        existingOrder.setTotalAmount(new BigDecimal("9000.00"));
        existingOrder.setCouponCode("TEST10");
        existingOrder.setDiscountAmount(new BigDecimal("1000.00"));
        existingOrder.setStatus("CONFIRMED");
        existingOrder.setPaymentMethod("COD");
        existingOrder.setPaymentStatus("PENDING");
        orderRepository.save(existingOrder);

        // Now attempt to use TEST10 again with same user
        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                couponService.validateCoupon(testUser.getId(), "TEST10", new BigDecimal("5000.00"))
        );
        assertTrue(ex.getMessage().contains("already used coupon"));
    }

    @Test
    @DisplayName("Should support Admin Coupon CRUD operations")
    void testAdminCouponCrud() {
        // 1. Create Coupon
        CreateCouponRequest request = new CreateCouponRequest();
        request.setCode("ADMIN25");
        request.setDescription("Admin generated coupon");
        request.setDiscountType("PERCENTAGE");
        request.setDiscountValue(new BigDecimal("25.00"));
        request.setMinOrderAmount(new BigDecimal("5000.00"));

        CouponDto created = couponService.createCoupon(request);
        assertNotNull(created.getId());
        assertEquals("ADMIN25", created.getCode());
        assertTrue(created.getIsActive());

        // 2. Toggle Status
        CouponDto toggled = couponService.toggleCouponStatus(created.getId());
        assertFalse(toggled.getIsActive());

        // 3. Update Coupon
        request.setDescription("Updated description");
        request.setDiscountValue(new BigDecimal("30.00"));
        CouponDto updated = couponService.updateCoupon(created.getId(), request);
        assertEquals("Updated description", updated.getDescription());
        assertEquals(new BigDecimal("30.00"), updated.getDiscountValue());

        // 4. Delete Coupon
        couponService.deleteCoupon(created.getId());
        assertNull(couponService.getCouponByCode("ADMIN25"));
    }
}
