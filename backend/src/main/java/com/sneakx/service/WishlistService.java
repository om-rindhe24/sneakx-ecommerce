package com.sneakx.service;

import com.sneakx.dto.WishlistDto;
import com.sneakx.entity.Product;
import com.sneakx.entity.User;
import com.sneakx.entity.Wishlist;
import com.sneakx.entity.WishlistItem;
import com.sneakx.exception.ResourceNotFoundException;
import com.sneakx.repository.ProductRepository;
import com.sneakx.repository.UserRepository;
import com.sneakx.repository.WishlistItemRepository;
import com.sneakx.repository.WishlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    public WishlistService(WishlistRepository wishlistRepository,
                           WishlistItemRepository wishlistItemRepository,
                           ProductRepository productRepository,
                           UserRepository userRepository,
                           ProductService productService) {
        this.wishlistRepository = wishlistRepository;
        this.wishlistItemRepository = wishlistItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.productService = productService;
    }

    @Transactional
    public Wishlist getOrCreateWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                    Wishlist w = new Wishlist(user);
                    return wishlistRepository.save(w);
                });
    }

    @Transactional(readOnly = true)
    public WishlistDto getWishlistDtoForUser(Long userId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        return mapToWishlistDto(wishlist);
    }

    @Transactional
    public WishlistDto toggleWishlist(Long userId, Long productId) {
        Wishlist wishlist = getOrCreateWishlist(userId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Optional<WishlistItem> itemOpt = wishlistItemRepository.findByWishlistIdAndProductId(wishlist.getId(), product.getId());

        if (itemOpt.isPresent()) {
            wishlistItemRepository.delete(itemOpt.get());
            wishlist.getItems().remove(itemOpt.get());
        } else {
            WishlistItem item = new WishlistItem(wishlist, product);
            wishlistItemRepository.save(item);
            wishlist.getItems().add(item);
        }

        return mapToWishlistDto(wishlist);
    }

    @Transactional(readOnly = true)
    public Boolean isInWishlist(Long userId, Long productId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        return wishlistItemRepository.existsByWishlistIdAndProductId(wishlist.getId(), productId);
    }

    private WishlistDto mapToWishlistDto(Wishlist wishlist) {
        WishlistDto dto = new WishlistDto();
        dto.setId(wishlist.getId());
        if (wishlist.getItems() != null) {
            dto.setItems(wishlist.getItems().stream()
                    .map(item -> productService.mapToProductDto(item.getProduct()))
                    .collect(Collectors.toList()));
            dto.setTotalItems(dto.getItems().size());
        }
        return dto;
    }
}
