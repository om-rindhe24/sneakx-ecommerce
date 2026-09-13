package com.sneakx.service;

import com.sneakx.dto.*;
import com.sneakx.entity.*;
import com.sneakx.exception.BadRequestException;
import com.sneakx.exception.InsufficientStockException;
import com.sneakx.exception.ResourceNotFoundException;
import com.sneakx.exception.UnauthorizedException;
import com.sneakx.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartService cartService;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository variantRepository;
    private final EmailService emailService;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        CartRepository cartRepository,
                        CartService cartService,
                        AddressRepository addressRepository,
                        UserRepository userRepository,
                        ProductVariantRepository variantRepository,
                        EmailService emailService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.cartService = cartService;
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
        this.variantRepository = variantRepository;
        this.emailService = emailService;
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
            address = new Address();
            address.setUser(user);
            address.setFullName(req.getFullName());
            address.setPhone(req.getPhone());
            address.setStreetAddress(req.getStreetAddress());
            address.setCity(req.getCity());
            address.setState(req.getState());
            address.setPostalCode(req.getPostalCode());
            address.setCountry(req.getCountry() != null ? req.getCountry() : "India");
            address.setIsDefault(req.getIsDefault());
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

        // 3. Calculate Final Total (Free shipping over 5000)
        BigDecimal shipping = subtotal.compareTo(BigDecimal.valueOf(5000)) >= 0 ? BigDecimal.ZERO : BigDecimal.valueOf(250);
        BigDecimal totalAmount = subtotal.add(shipping);

        // 4. Create and Save Order
        Order order = new Order();
        order.setOrderNumber("SNK-" + System.currentTimeMillis() % 1000000 + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        order.setUser(user);
        order.setAddress(address);
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
        }

        order.setStatus(newStatus.toUpperCase());
        if ("DELIVERED".equalsIgnoreCase(newStatus)) {
            order.setPaymentStatus("PAID");
        }

        Order saved = orderRepository.save(order);
        return mapToOrderDto(saved);
    }

    public OrderDto mapToOrderDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setCustomerName(order.getUser() != null ? order.getUser().getFullName() : "Customer");
        dto.setCustomerEmail(order.getUser() != null ? order.getUser().getEmail() : "");
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setPaymentReference(order.getPaymentReference());
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
}
