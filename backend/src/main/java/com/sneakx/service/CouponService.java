package com.sneakx.service;

import com.sneakx.dto.CouponDto;
import com.sneakx.dto.CouponValidationResponse;
import com.sneakx.dto.CreateCouponRequest;
import com.sneakx.entity.Cart;
import com.sneakx.entity.CartItem;
import com.sneakx.entity.Coupon;
import com.sneakx.exception.BadRequestException;
import com.sneakx.exception.ResourceNotFoundException;
import com.sneakx.repository.CartRepository;
import com.sneakx.repository.CouponRepository;
import com.sneakx.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CouponService {

    private static final Logger log = LoggerFactory.getLogger(CouponService.class);

    private final CouponRepository couponRepository;
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;

    public CouponService(CouponRepository couponRepository,
                         OrderRepository orderRepository,
                         CartRepository cartRepository) {
        this.couponRepository = couponRepository;
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
    }

    /**
     * Validates a coupon code against a specific user and order subtotal.
     * Computes the exact discount and returns a detailed validation response.
     */
    @Transactional(readOnly = true)
    public CouponValidationResponse validateCoupon(Long userId, String code, BigDecimal explicitSubtotal) {
        if (code == null || code.trim().isBlank()) {
            throw new BadRequestException("Coupon code is required.");
        }

        String normalizedCode = code.trim().toUpperCase();

        Coupon coupon = couponRepository.findByCodeIgnoreCase(normalizedCode)
                .orElseThrow(() -> new BadRequestException("Invalid coupon code '" + normalizedCode + "'."));

        if (!coupon.getIsActive()) {
            throw new BadRequestException("Coupon '" + normalizedCode + "' is no longer active.");
        }

        if (coupon.getExpiryDate() != null && LocalDateTime.now().isAfter(coupon.getExpiryDate())) {
            throw new BadRequestException("Coupon '" + normalizedCode + "' has expired.");
        }

        if (coupon.getTotalUsageLimit() != null && coupon.getUsageCount() >= coupon.getTotalUsageLimit()) {
            throw new BadRequestException("Coupon '" + normalizedCode + "' has reached its maximum redemption limit.");
        }

        // Determine applicable subtotal: explicit subtotal or from user's current shopping cart
        BigDecimal subtotal = explicitSubtotal;
        if (subtotal == null || subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            if (userId != null) {
                Cart cart = cartRepository.findByUserId(userId).orElse(null);
                if (cart != null && cart.getItems() != null) {
                    subtotal = BigDecimal.ZERO;
                    for (CartItem item : cart.getItems()) {
                        subtotal = subtotal.add(item.getVariant().getEffectivePrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                    }
                }
            }
        }

        if (subtotal == null || subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Your cart is empty. Add sneakers before applying a coupon.");
        }

        // Check minimum order amount requirement
        if (coupon.getMinOrderAmount() != null && subtotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BadRequestException("Minimum order value of ₹" + coupon.getMinOrderAmount().intValue()
                    + " required for coupon " + normalizedCode + ".");
        }

        // Check one-use-per-user restriction
        if (coupon.getOnePerUser() && userId != null) {
            boolean alreadyUsed = orderRepository.existsByUserIdAndCouponCodeIgnoreCaseAndStatusNot(
                    userId, normalizedCode, "CANCELLED"
            );
            if (alreadyUsed) {
                throw new BadRequestException("You have already used coupon '" + normalizedCode + "' on a previous order.");
            }
        }

        // Calculate discount amount
        BigDecimal discountAmount = calculateDiscount(coupon, subtotal);

        // Shipping calculation (free over 5000)
        BigDecimal shipping = subtotal.compareTo(BigDecimal.valueOf(5000)) >= 0 ? BigDecimal.ZERO : BigDecimal.valueOf(250);
        BigDecimal newTotal = subtotal.subtract(discountAmount).add(shipping);
        if (newTotal.compareTo(BigDecimal.ZERO) < 0) {
            newTotal = BigDecimal.ZERO;
        }

        log.info("[COUPON] Validated coupon {} for user {}: subtotal ₹{}, discount ₹{}, final ₹{}",
                normalizedCode, userId, subtotal, discountAmount, newTotal);

        return new CouponValidationResponse(
                true,
                coupon.getCode(),
                coupon.getDescription(),
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                discountAmount,
                subtotal,
                newTotal,
                shipping
        );
    }

    /**
     * Pure discount calculation helper.
     */
    public BigDecimal calculateDiscount(Coupon coupon, BigDecimal subtotal) {
        if (coupon == null || subtotal == null || subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount;
        if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = subtotal.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discount = coupon.getMaxDiscountAmount();
            }
        } else {
            // FLAT discount
            discount = coupon.getDiscountValue();
        }

        // Cap discount so total cannot be negative
        if (discount.compareTo(subtotal) > 0) {
            discount = subtotal;
        }
        if (discount.compareTo(BigDecimal.ZERO) < 0) {
            discount = BigDecimal.ZERO;
        }

        return discount;
    }

    /**
     * Finds active coupon entity by code.
     */
    @Transactional(readOnly = true)
    public Coupon getCouponByCode(String code) {
        if (code == null || code.trim().isBlank()) return null;
        return couponRepository.findByCodeIgnoreCase(code.trim().toUpperCase()).orElse(null);
    }

    // ------------------------------------------------------------------------
    // ADMIN OPERATIONS
    // ------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<CouponDto> getAllCoupons() {
        return couponRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(CouponDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public CouponDto createCoupon(CreateCouponRequest request) {
        if (request.getCode() == null || request.getCode().trim().isBlank()) {
            throw new BadRequestException("Coupon code is required.");
        }
        String normalizedCode = request.getCode().trim().toUpperCase();

        if (couponRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new BadRequestException("A coupon with code '" + normalizedCode + "' already exists.");
        }

        Coupon coupon = new Coupon();
        coupon.setCode(normalizedCode);
        coupon.setDescription(request.getDescription());
        coupon.setDiscountType(request.getDiscountType() != null ? request.getDiscountType().trim().toUpperCase() : "PERCENTAGE");
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setMinOrderAmount(request.getMinOrderAmount());
        coupon.setExpiryDate(request.getExpiryDate());
        coupon.setTotalUsageLimit(request.getTotalUsageLimit());
        coupon.setUsageCount(0);
        coupon.setOnePerUser(request.getOnePerUser() != null ? request.getOnePerUser() : true);
        coupon.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        Coupon saved = couponRepository.save(coupon);
        log.info("[ADMIN-COUPON] Created coupon {} (type: {}, value: {})", saved.getCode(), saved.getDiscountType(), saved.getDiscountValue());
        return CouponDto.fromEntity(saved);
    }

    @Transactional
    public CouponDto updateCoupon(Long id, CreateCouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));

        String normalizedCode = request.getCode().trim().toUpperCase();
        if (!coupon.getCode().equalsIgnoreCase(normalizedCode) && couponRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new BadRequestException("A coupon with code '" + normalizedCode + "' already exists.");
        }

        coupon.setCode(normalizedCode);
        coupon.setDescription(request.getDescription());
        coupon.setDiscountType(request.getDiscountType() != null ? request.getDiscountType().trim().toUpperCase() : "PERCENTAGE");
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setMinOrderAmount(request.getMinOrderAmount());
        coupon.setExpiryDate(request.getExpiryDate());
        coupon.setTotalUsageLimit(request.getTotalUsageLimit());
        if (request.getOnePerUser() != null) coupon.setOnePerUser(request.getOnePerUser());
        if (request.getIsActive() != null) coupon.setIsActive(request.getIsActive());

        Coupon updated = couponRepository.save(coupon);
        log.info("[ADMIN-COUPON] Updated coupon {}", updated.getCode());
        return CouponDto.fromEntity(updated);
    }

    @Transactional
    public CouponDto toggleCouponStatus(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));

        coupon.setIsActive(!coupon.getIsActive());
        Coupon updated = couponRepository.save(coupon);
        log.info("[ADMIN-COUPON] Toggled coupon {} status to {}", updated.getCode(), updated.getIsActive());
        return CouponDto.fromEntity(updated);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
        couponRepository.delete(coupon);
        log.info("[ADMIN-COUPON] Deleted coupon {}", coupon.getCode());
    }
}
