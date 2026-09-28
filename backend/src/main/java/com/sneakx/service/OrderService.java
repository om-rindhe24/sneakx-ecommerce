package com.sneakx.service;

import com.sneakx.dto.*;
import com.sneakx.entity.*;
import com.sneakx.exception.BadRequestException;
import com.sneakx.exception.InsufficientStockException;
import com.sneakx.exception.ResourceNotFoundException;
import com.sneakx.exception.UnauthorizedException;
import com.sneakx.repository.*;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    @Value("${app.razorpay.key-id:}")
    private String razorpayKeyId;

    @Value("${app.razorpay.key-secret:}")
    private String razorpayKeySecret;

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartService cartService;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository variantRepository;
    private final EmailService emailService;
    private final CouponService couponService;
    private final CouponRepository couponRepository;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        CartRepository cartRepository,
                        CartService cartService,
                        AddressRepository addressRepository,
                        UserRepository userRepository,
                        ProductVariantRepository variantRepository,
                        EmailService emailService,
                        CouponService couponService,
                        CouponRepository couponRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.cartService = cartService;
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
        this.variantRepository = variantRepository;
        this.emailService = emailService;
        this.couponService = couponService;
        this.couponRepository = couponRepository;
    }

    @Transactional
    public OrderDto checkout(Long userId, CheckoutRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("No active shopping cart found."));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Your cart is empty. Please add items before checkout.");
        }

        // 1. Resolve Delivery Address
        Address address;
        if (request.getAddressId() != null) {
            address = addressRepository.findById(request.getAddressId())
                    .orElseThrow(() -> new ResourceNotFoundException("Address", "id", request.getAddressId()));
            if (!address.getUser().getId().equals(userId)) {
                throw new UnauthorizedException("Unauthorized address selected.");
            }
        } else if (request.getNewAddress() != null) {
            CreateAddressRequest req = request.getNewAddress();
            boolean isDefault = Boolean.TRUE.equals(req.getIsDefault());
            if (isDefault) {
                List<Address> userAddresses = addressRepository.findByUserId(userId);
                for (Address a : userAddresses) {
                    if (Boolean.TRUE.equals(a.getIsDefault())) {
                        a.setIsDefault(false);
                        addressRepository.save(a);
                    }
                }
            }

            address = new Address();
            address.setUser(user);
            address.setFullName(req.getFullName().trim());
            address.setPhone(req.getPhone().trim());
            address.setStreetAddress(req.getStreetAddress().trim());
            address.setCity(req.getCity().trim());
            address.setState(req.getState().trim());
            address.setPostalCode(req.getPostalCode().trim());
            address.setCountry(req.getCountry() != null && !req.getCountry().isBlank() ? req.getCountry().trim() : "India");
            address.setIsDefault(isDefault);
            address = addressRepository.save(address);
        } else {
            throw new BadRequestException("A valid delivery address is required for checkout.");
        }

        // 2. Validate Stock and Calculate Subtotal
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cart.getItems()) {
            ProductVariant variant = cartItem.getVariant();
            int requestedQty = cartItem.getQuantity();

            if (variant.getStockQuantity() < requestedQty) {
                throw new InsufficientStockException(variant.getSku(), requestedQty, variant.getStockQuantity());
            }

            // Atomic stock deduction
            variant.setStockQuantity(variant.getStockQuantity() - requestedQty);
            variantRepository.save(variant);

            // Create immutable OrderItem snapshot
            Product product = variant.getProduct();
            OrderItem orderItem = new OrderItem();
            orderItem.setVariant(variant);
            orderItem.setProductName(product.getName());
            orderItem.setBrand(product.getBrand() != null ? product.getBrand().getName() : "SNEAKX");
            orderItem.setSize(variant.getSize());
            orderItem.setSku(variant.getSku());
            orderItem.setColorway(product.getColorway());
            orderItem.setImageUrl(product.getPrimaryImageUrl());
            orderItem.setPrice(variant.getEffectivePrice());
            orderItem.setQuantity(requestedQty);

            orderItems.add(orderItem);
            subtotal = subtotal.add(orderItem.getSubtotal());
        }

        // 3. Calculate Discount and Final Total
        BigDecimal discountAmount = BigDecimal.ZERO;
        String appliedCouponCode = null;

        if (request.getCouponCode() != null && !request.getCouponCode().trim().isBlank()) {
            CouponValidationResponse couponResp = couponService.validateCoupon(userId, request.getCouponCode(), subtotal);
            discountAmount = couponResp.getDiscountAmount();
            appliedCouponCode = couponResp.getCode();

            Coupon couponEntity = couponRepository.findByCodeIgnoreCase(appliedCouponCode).orElse(null);
            if (couponEntity != null) {
                couponEntity.setUsageCount(couponEntity.getUsageCount() + 1);
                couponRepository.save(couponEntity);
            }
        }

        BigDecimal discountedSubtotal = subtotal.subtract(discountAmount);
        if (discountedSubtotal.compareTo(BigDecimal.ZERO) < 0) {
            discountedSubtotal = BigDecimal.ZERO;
        }

        BigDecimal shipping = subtotal.compareTo(BigDecimal.valueOf(5000)) >= 0 ? BigDecimal.ZERO : BigDecimal.valueOf(250);
        BigDecimal totalAmount = discountedSubtotal.add(shipping);

        // 4. Create and Save Order
        Order order = new Order();
        order.setOrderNumber("SNK-" + System.currentTimeMillis() % 1000000 + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        order.setUser(user);
        order.setAddress(address);
        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);
        order.setCouponCode(appliedCouponCode);
        order.setTotalAmount(totalAmount);
        order.setStatus("CONFIRMED");
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "COD");
        order.setPaymentStatus("COD".equalsIgnoreCase(request.getPaymentMethod()) ? "PENDING" : "PAID");
        order.setPaymentReference(request.getPaymentReference());

        Order savedOrder = orderRepository.save(order);

        for (OrderItem item : orderItems) {
            item.setOrder(savedOrder);
            orderItemRepository.save(item);
        }
        savedOrder.setItems(orderItems);

        // 5. Clear Cart
        cartService.clearCart(userId);

        // 6. Send Order Confirmation Email AFTER TRANSACTION COMMIT
        // Guarantees that if checkout or database transaction rolls back, no email is ever sent
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    try {
                        emailService.sendOrderConfirmation(savedOrder);
                    } catch (Exception ex) {
                        log.error("[ORDER-SERVICE] Safe catch: confirmation email dispatch failed after commit for order {}: {}",
                                savedOrder.getOrderNumber(), ex.getMessage());
                    }
                }
            });
        } else {
            try {
                emailService.sendOrderConfirmation(savedOrder);
            } catch (Exception ex) {
                log.error("[ORDER-SERVICE] Safe catch: confirmation email dispatch failed for order {}: {}",
                        savedOrder.getOrderNumber(), ex.getMessage());
            }
        }

        return mapToOrderDto(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToOrderDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long userId, Long orderId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!isAdmin && !order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Unauthorized access to this order.");
        }

        return mapToOrderDto(order);
    }

    @Transactional
    public OrderDto updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if ("CANCELLED".equalsIgnoreCase(order.getStatus())) {
            throw new BadRequestException("Cancelled orders cannot be modified or reactivated.");
        }

        Set<String> validStatuses = new HashSet<>(Arrays.asList("PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"));
        if (!validStatuses.contains(newStatus.toUpperCase())) {
            throw new BadRequestException("Invalid status transition: " + newStatus);
        }

        // Restock inventory if cancelled
        if ("CANCELLED".equalsIgnoreCase(newStatus) && !"CANCELLED".equalsIgnoreCase(order.getStatus())) {
            for (OrderItem item : order.getItems()) {
                if (item.getVariant() != null) {
                    ProductVariant v = item.getVariant();
                    v.setStockQuantity(v.getStockQuantity() + item.getQuantity());
                    variantRepository.save(v);
                }
            }
            if (order.getCouponCode() != null && !order.getCouponCode().trim().isEmpty()) {
                couponRepository.findByCodeIgnoreCase(order.getCouponCode().trim()).ifPresent(coupon -> {
                    if (coupon.getUsageCount() != null && coupon.getUsageCount() > 0) {
                        coupon.setUsageCount(coupon.getUsageCount() - 1);
                        couponRepository.save(coupon);
                    }
                });
            }
            if (order.getCancelledAt() == null) {
                order.setCancelledAt(LocalDateTime.now());
            }
            if (order.getCancellationReason() == null) {
                order.setCancellationReason("Cancelled by Administrator");
            }
        }

        order.setStatus(newStatus.toUpperCase());
        if ("DELIVERED".equalsIgnoreCase(newStatus)) {
            order.setPaymentStatus("PAID");
        }

        Order saved = orderRepository.save(order);
        return mapToOrderDto(saved);
    }

    @Transactional
    public OrderDto cancelOrder(Long userId, Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // 1. Ownership check: Only the owner can cancel
        if (order.getUser() == null || !order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to cancel this order.");
        }

        // 2. Reject non-cancellable or already cancelled orders
        String currentStatus = order.getStatus() != null ? order.getStatus().toUpperCase() : "";
        if ("CANCELLED".equals(currentStatus)) {
            throw new BadRequestException("Order #" + order.getOrderNumber() + " is already cancelled.");
        }
        if ("SHIPPED".equals(currentStatus)) {
            throw new BadRequestException("Orders that have already been shipped cannot be cancelled.");
        }
        if ("DELIVERED".equals(currentStatus)) {
            throw new BadRequestException("Delivered orders cannot be cancelled.");
        }

        Set<String> cancellableStatuses = new HashSet<>(Arrays.asList("PENDING", "CONFIRMED", "PROCESSING", "PLACED"));
        if (!cancellableStatuses.contains(currentStatus)) {
            throw new BadRequestException("Order cannot be cancelled in status: " + currentStatus);
        }

        // 3. Mark status, cancelledAt, and cancellation reason
        order.setStatus("CANCELLED");
        order.setCancelledAt(LocalDateTime.now());
        order.setCancellationReason(reason != null && !reason.trim().isEmpty() ? reason.trim() : "Cancelled by customer");

        // 4. Stock restoration (idempotent because status check prevents re-entry)
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                if (item.getVariant() != null) {
                    ProductVariant variant = item.getVariant();
                    variant.setStockQuantity(variant.getStockQuantity() + item.getQuantity());
                    variantRepository.save(variant);
                }
            }
        }

        // 5. Restore coupon usage count
        if (order.getCouponCode() != null && !order.getCouponCode().trim().isEmpty()) {
            couponRepository.findByCodeIgnoreCase(order.getCouponCode().trim()).ifPresent(coupon -> {
                if (coupon.getUsageCount() != null && coupon.getUsageCount() > 0) {
                    coupon.setUsageCount(coupon.getUsageCount() - 1);
                    couponRepository.save(coupon);
                }
            });
        }

        // 6. Process refund
        boolean isCod = "COD".equalsIgnoreCase(order.getPaymentMethod()) ||
                "PENDING".equalsIgnoreCase(order.getPaymentStatus());

        if (isCod) {
            order.setRefundStatus("NO_REFUND_REQUIRED");
            order.setRefundAmount(BigDecimal.ZERO);
            order.setRefundId(null);
            log.info("[ORDER-CANCEL] Order #{} cancelled (COD - No refund required)", order.getOrderNumber());
        } else {
            // Razorpay / Paid order
            BigDecimal refundAmt = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
            boolean hasRealRazorpayRef = order.getPaymentReference() != null && order.getPaymentReference().startsWith("pay_");
            boolean hasKeys = razorpayKeyId != null && !razorpayKeyId.isBlank() && razorpayKeySecret != null && !razorpayKeySecret.isBlank();

            if (hasRealRazorpayRef && hasKeys) {
                try {
                    RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
                    JSONObject refundReq = new JSONObject();
                    long amountInPaise = refundAmt.multiply(BigDecimal.valueOf(100)).longValue();
                    refundReq.put("amount", amountInPaise);
                    refundReq.put("speed", "normal");
                    JSONObject notes = new JSONObject();
                    notes.put("orderNumber", order.getOrderNumber());
                    notes.put("reason", order.getCancellationReason());
                    refundReq.put("notes", notes);

                    com.razorpay.Refund r = razorpay.payments.refund(order.getPaymentReference(), refundReq);
                    String refundId = r.get("id");
                    order.setRefundId(refundId);
                    order.setRefundAmount(refundAmt);
                    order.setRefundStatus("PROCESSED");
                    log.info("[ORDER-CANCEL] Razorpay refund {} processed for order #{} (amount: ₹{})",
                            refundId, order.getOrderNumber(), refundAmt);
                } catch (Exception ex) {
                    log.error("[ORDER-CANCEL] Razorpay refund failed for order #{}: {}",
                            order.getOrderNumber(), ex.getMessage(), ex);
                    order.setRefundStatus("REFUND_PENDING");
                    order.setRefundAmount(refundAmt);
                    order.setRefundId(null);
                }
            } else {
                // Demo / Simulated mode or test payment without live credentials
                String demoRefundId = "rfnd_demo_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
                order.setRefundId(demoRefundId);
                order.setRefundAmount(refundAmt);
                order.setRefundStatus("PROCESSED");
                log.info("[ORDER-CANCEL] Demo refund {} recorded for order #{} (amount: ₹{})",
                        demoRefundId, order.getOrderNumber(), refundAmt);
            }
        }

        Order savedOrder = orderRepository.save(order);

        // 7. Dispatch cancellation email safely after commit
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    try {
                        emailService.sendOrderCancellation(savedOrder);
                    } catch (Exception ex) {
                        log.error("[ORDER-SERVICE] Safe catch: cancellation email dispatch failed after commit for order {}: {}",
                                savedOrder.getOrderNumber(), ex.getMessage());
                    }
                }
            });
        } else {
            try {
                emailService.sendOrderCancellation(savedOrder);
            } catch (Exception ex) {
                log.error("[ORDER-SERVICE] Safe catch: cancellation email dispatch failed for order {}: {}",
                        savedOrder.getOrderNumber(), ex.getMessage());
            }
        }

        return mapToOrderDto(savedOrder);
    }

    public OrderDto mapToOrderDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setCustomerName(order.getUser() != null ? order.getUser().getFullName() : "Customer");
        dto.setCustomerEmail(order.getUser() != null ? order.getUser().getEmail() : "");
        dto.setTotalAmount(order.getTotalAmount());
        dto.setSubtotal(order.getSubtotal() != null ? order.getSubtotal() : order.getTotalAmount());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setCouponCode(order.getCouponCode());
        dto.setStatus(order.getStatus());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setPaymentReference(order.getPaymentReference());
        dto.setCancellationReason(order.getCancellationReason());
        dto.setCancelledAt(order.getCancelledAt());
        dto.setRefundStatus(order.getRefundStatus());
        dto.setRefundAmount(order.getRefundAmount());
        dto.setRefundId(order.getRefundId());
        dto.setConfirmationEmailSent(order.getConfirmationEmailSent());
        dto.setCreatedAt(order.getCreatedAt());

        if (order.getAddress() != null) {
            Address a = order.getAddress();
            AddressDto ad = new AddressDto();
            ad.setId(a.getId());
            ad.setFullName(a.getFullName());
            ad.setPhone(a.getPhone());
            ad.setStreetAddress(a.getStreetAddress());
            ad.setCity(a.getCity());
            ad.setState(a.getState());
            ad.setPostalCode(a.getPostalCode());
            ad.setCountry(a.getCountry());
            ad.setIsDefault(a.getIsDefault());
            dto.setShippingAddress(ad);
        }

        if (order.getItems() != null) {
            dto.setItems(order.getItems().stream().map(item -> {
                OrderItemDto idto = new OrderItemDto();
                idto.setId(item.getId());
                idto.setVariantId(item.getVariant() != null ? item.getVariant().getId() : null);
                idto.setProductName(item.getProductName());
                idto.setBrand(item.getBrand());
                idto.setSize(item.getSize());
                idto.setSku(item.getSku());
                idto.setColorway(item.getColorway());
                idto.setImageUrl(item.getImageUrl());
                idto.setPrice(item.getPrice());
                idto.setQuantity(item.getQuantity());
                idto.setSubtotal(item.getSubtotal());
                return idto;
            }).collect(Collectors.toList()));
        }

        return dto;
    }

    public void setRazorpayKeyId(String razorpayKeyId) {
        this.razorpayKeyId = razorpayKeyId;
    }

    public void setRazorpayKeySecret(String razorpayKeySecret) {
        this.razorpayKeySecret = razorpayKeySecret;
    }
}
