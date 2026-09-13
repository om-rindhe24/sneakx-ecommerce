package com.sneakx.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.sneakx.dto.*;
import com.sneakx.entity.Cart;
import com.sneakx.entity.CartItem;
import com.sneakx.entity.Order;
import com.sneakx.exception.BadRequestException;
import com.sneakx.exception.ResourceNotFoundException;
import com.sneakx.repository.CartRepository;
import com.sneakx.repository.OrderRepository;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;

    @Value("${app.razorpay.key-id:}")
    private String keyId;

    @Value("${app.razorpay.key-secret:}")
    private String keySecret;

    public PaymentService(OrderService orderService,
                          OrderRepository orderRepository,
                          CartRepository cartRepository) {
        this.orderService = orderService;
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
    }

    /**
     * Creates a new Razorpay order via Razorpay Orders API.
     */
    public PaymentOrderResponse createPaymentOrder(Long userId, CreatePaymentOrderRequest request) {
        if (keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank()) {
            throw new BadRequestException("Razorpay payment gateway credentials are not configured.");
        }

        BigDecimal amount = request != null ? request.getAmount() : null;

        // If amount was not explicitly provided in request, calculate from user's active cart
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            Cart cart = cartRepository.findByUserId(userId)
                    .orElseThrow(() -> new BadRequestException("No active shopping cart found."));
            if (cart.getItems() == null || cart.getItems().isEmpty()) {
                throw new BadRequestException("Cart is empty.");
            }

            BigDecimal subtotal = BigDecimal.ZERO;
            for (CartItem item : cart.getItems()) {
                subtotal = subtotal.add(item.getVariant().getEffectivePrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            }
            BigDecimal shipping = subtotal.compareTo(BigDecimal.valueOf(5000)) >= 0 ? BigDecimal.ZERO : BigDecimal.valueOf(250);
            amount = subtotal.add(shipping);
        }

        // Razorpay expects amount in smallest currency unit (paise for INR)
        long amountInPaise = amount.multiply(BigDecimal.valueOf(100)).longValue();

        try {
            RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "rcpt_" + userId + "_" + System.currentTimeMillis());

            com.razorpay.Order razorpayOrder = razorpay.orders.create(orderRequest);
            String razorpayOrderId = razorpayOrder.get("id");

            log.info("[RAZORPAY] Created Razorpay order {} for user {} for amount ₹{} ({} paise)",
                    razorpayOrderId, userId, amount, amountInPaise);

            return new PaymentOrderResponse(razorpayOrderId, amount, amountInPaise, "INR", keyId);
        } catch (RazorpayException ex) {
            log.error("[RAZORPAY] Error creating Razorpay order: {}", ex.getMessage(), ex);
            throw new BadRequestException("Failed to initiate Razorpay payment order: " + ex.getMessage());
        }
    }

    /**
     * Verifies the HMAC-SHA256 signature sent by frontend after customer completes checkout modal.
     * If valid, confirms the order, deducts stock, clears cart, triggers email.
     */
    @Transactional
    public OrderDto verifyPaymentAndConfirmOrder(Long userId, PaymentVerificationRequest request) {
        if (keySecret == null || keySecret.isBlank()) {
            throw new BadRequestException("Razorpay payment gateway secret is not configured.");
        }

        boolean isValid = verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature(),
                keySecret
        );

        if (!isValid) {
            log.warn("[RAZORPAY] Signature verification failed for orderId: {}, paymentId: {}",
                    request.getRazorpayOrderId(), request.getRazorpayPaymentId());
            throw new BadRequestException("Invalid payment signature. Payment verification failed.");
        }

        log.info("[RAZORPAY] Signature verified successfully for paymentId: {}, orderId: {}",
                request.getRazorpayPaymentId(), request.getRazorpayOrderId());

        // Case A: Pre-existing order ID provided
        if (request.getOrderId() != null) {
            Order order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order", "id", request.getOrderId()));
            order.setStatus("CONFIRMED");
            order.setPaymentStatus("PAID");
            order.setPaymentReference(request.getRazorpayPaymentId());
            Order updated = orderRepository.save(order);
            return orderService.mapToOrderDto(updated);
        }

        // Case B: Create atomic order upon verified payment
        CheckoutRequest checkoutRequest = new CheckoutRequest();
        checkoutRequest.setAddressId(request.getAddressId());
        checkoutRequest.setNewAddress(request.getNewAddress());
        checkoutRequest.setPaymentMethod("RAZORPAY");
        checkoutRequest.setPaymentReference(request.getRazorpayPaymentId());

        return orderService.checkout(userId, checkoutRequest);
    }

    /**
     * Verifies Razorpay payment signature using HMAC-SHA256.
     * Formula: HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, secret) == razorpay_signature
     */
    private boolean verifySignature(String orderId, String paymentId, String signature, String secret) {
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

            return hex.toString().equalsIgnoreCase(signature);
        } catch (Exception e) {
            log.error("[RAZORPAY] Exception while verifying signature: {}", e.getMessage());
            return false;
        }
    }
}
