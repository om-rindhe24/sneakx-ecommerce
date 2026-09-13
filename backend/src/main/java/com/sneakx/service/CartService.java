package com.sneakx.service;

import com.sneakx.dto.AddToCartRequest;
import com.sneakx.dto.CartDto;
import com.sneakx.dto.CartItemDto;
import com.sneakx.entity.*;
import com.sneakx.exception.BadRequestException;
import com.sneakx.exception.InsufficientStockException;
import com.sneakx.exception.ResourceNotFoundException;
import com.sneakx.repository.CartItemRepository;
import com.sneakx.repository.CartRepository;
import com.sneakx.repository.ProductVariantRepository;
import com.sneakx.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       ProductVariantRepository variantRepository,
                       UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.variantRepository = variantRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                    Cart newCart = new Cart(user);
                    return cartRepository.save(newCart);
                });
    }

    @Transactional
    public CartDto getCartDtoForUser(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToCartDto(cart);
    }

    @Transactional
    public CartDto addToCart(Long userId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);

        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", request.getVariantId()));

        if (variant.getStockQuantity() <= 0) {
            throw new InsufficientStockException("This size variant is completely out of stock.");
        }

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndVariantId(cart.getId(), variant.getId());

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            int newQuantity = existingItem.getQuantity() + request.getQuantity();

            if (newQuantity > variant.getStockQuantity()) {
                throw new InsufficientStockException(variant.getSku(), newQuantity, variant.getStockQuantity());
            }
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            if (request.getQuantity() > variant.getStockQuantity()) {
                throw new InsufficientStockException(variant.getSku(), request.getQuantity(), variant.getStockQuantity());
            }
            CartItem newItem = new CartItem(cart, variant, request.getQuantity());
            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }

        return getCartDtoForUser(userId);
    }

    @Transactional
    public CartDto updateItemQuantity(Long userId, Long cartItemId, int newQuantity) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Unauthorized access to cart item.");
        }

        if (newQuantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            if (newQuantity > item.getVariant().getStockQuantity()) {
                throw new InsufficientStockException(item.getVariant().getSku(), newQuantity, item.getVariant().getStockQuantity());
            }
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        }

        return getCartDtoForUser(userId);
    }

    @Transactional
    public CartDto removeItem(Long userId, Long cartItemId) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Unauthorized access to cart item.");
        }

        cartItemRepository.delete(item);
        return getCartDtoForUser(userId);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        if (cart.getItems() != null) {
            cart.getItems().clear();
            cartRepository.save(cart);
        }
    }

    public CartDto mapToCartDto(Cart cart) {
        CartDto dto = new CartDto();
        dto.setId(cart.getId());

        List<CartItemDto> itemDtos = new ArrayList<>();
        int totalItems = 0;
        BigDecimal subtotal = BigDecimal.ZERO;

        if (cart.getItems() != null) {
            for (CartItem item : cart.getItems()) {
                ProductVariant variant = item.getVariant();
                Product product = variant.getProduct();

                CartItemDto itemDto = new CartItemDto();
                itemDto.setId(item.getId());
                itemDto.setVariantId(variant.getId());
                itemDto.setProductId(product.getId());
                itemDto.setProductName(product.getName());
                itemDto.setProductSlug(product.getSlug());
                itemDto.setBrandName(product.getBrand() != null ? product.getBrand().getName() : "");
                itemDto.setSize(variant.getSize());
                itemDto.setColorway(product.getColorway());
                itemDto.setImageUrl(product.getPrimaryImageUrl());
                itemDto.setUnitPrice(variant.getEffectivePrice());
                itemDto.setQuantity(item.getQuantity());
                itemDto.setStockQuantity(variant.getStockQuantity());
                itemDto.setItemTotal(item.getItemTotal());

                itemDtos.add(itemDto);

                totalItems += item.getQuantity();
                subtotal = subtotal.add(item.getItemTotal());
            }
        }

        dto.setItems(itemDtos);
        dto.setTotalItems(totalItems);
        dto.setSubtotal(subtotal);

        // Free shipping if subtotal >= 5000 or subtotal == 0, else 250 flat
        BigDecimal shipping = (subtotal.compareTo(BigDecimal.ZERO) == 0 || subtotal.compareTo(BigDecimal.valueOf(5000)) >= 0)
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(250);

        dto.setShipping(shipping);
        dto.setTotal(subtotal.add(shipping));

        return dto;
    }
}
