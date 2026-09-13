package com.sneakx.service;

import com.sneakx.dto.ProductDto;
import com.sneakx.entity.Product;
import com.sneakx.entity.Wishlist;
import com.sneakx.entity.WishlistItem;
import com.sneakx.exception.ResourceNotFoundException;
import com.sneakx.repository.ProductRepository;
import com.sneakx.repository.WishlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final ProductRepository productRepository;
    private final WishlistRepository wishlistRepository;
    private final ProductService productService;

    public RecommendationService(ProductRepository productRepository,
                                  WishlistRepository wishlistRepository,
                                  ProductService productService) {
        this.productRepository = productRepository;
        this.wishlistRepository = wishlistRepository;
        this.productService = productService;
    }

    /**
     * Explainable content-based recommendation algorithm:
     * Calculates affinity score for all candidates against target sneaker:
     * - Same Category: +3 points
     * - Same Brand: +2 points
     * - Similar Price Bracket (+/- 25%): +1 point
     * - Same Gender Target: +1 point
     */
    @Transactional(readOnly = true)
    public List<ProductDto> getSimilarProducts(Long targetProductId, int limit) {
        Product target = productRepository.findById(targetProductId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", targetProductId));

        List<Product> allActive = productRepository.findAll().stream()
                .filter(p -> p.getIsActive() && !p.getId().equals(targetProductId))
                .collect(Collectors.toList());

        List<ScoredProduct> scored = new ArrayList<>();

        for (Product candidate : allActive) {
            int score = 0;

            // 1. Category affinity (+3)
            if (target.getCategory() != null && candidate.getCategory() != null &&
                target.getCategory().getId().equals(candidate.getCategory().getId())) {
                score += 3;
            }

            // 2. Brand affinity (+2)
            if (target.getBrand() != null && candidate.getBrand() != null &&
                target.getBrand().getId().equals(candidate.getBrand().getId())) {
                score += 2;
            }

            // 3. Price proximity (+1)
            BigDecimal diff = target.getBasePrice().subtract(candidate.getBasePrice()).abs();
            BigDecimal threshold = target.getBasePrice().multiply(BigDecimal.valueOf(0.25));
            if (diff.compareTo(threshold) <= 0) {
                score += 1;
            }

            // 4. Gender compatibility (+1)
            if (target.getGender().equalsIgnoreCase(candidate.getGender())) {
                score += 1;
            }

            scored.add(new ScoredProduct(candidate, score));
        }

        // Sort descending by score, tie-break by popularity/rating
        scored.sort((a, b) -> {
            int cmp = Integer.compare(b.score, a.score);
            if (cmp != 0) return cmp;
            return Double.compare(b.product.getAverageRating(), a.product.getAverageRating());
        });

        return scored.stream()
                .limit(limit > 0 ? limit : 4)
                .map(sp -> productService.mapToProductDto(sp.product))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getPersonalizedRecommendationsForUser(Long userId, int limit) {
        Optional<Wishlist> wishlistOpt = wishlistRepository.findByUserId(userId);

        if (wishlistOpt.isPresent() && wishlistOpt.get().getItems() != null && !wishlistOpt.get().getItems().isEmpty()) {
            WishlistItem firstItem = wishlistOpt.get().getItems().get(0);
            return getSimilarProducts(firstItem.getProduct().getId(), limit);
        }

        // Fallback: Return top featured products
        return productService.getFeaturedProducts().stream()
                .limit(limit > 0 ? limit : 4)
                .collect(Collectors.toList());
    }

    private static class ScoredProduct {
        Product product;
        int score;

        ScoredProduct(Product product, int score) {
            this.product = product;
            this.score = score;
        }
    }
}
