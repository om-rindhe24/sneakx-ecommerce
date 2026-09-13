package com.sneakx.service;

import com.sneakx.dto.CreateReviewRequest;
import com.sneakx.dto.ReviewDto;
import com.sneakx.entity.Product;
import com.sneakx.entity.Review;
import com.sneakx.entity.User;
import com.sneakx.exception.ResourceNotFoundException;
import com.sneakx.repository.ProductRepository;
import com.sneakx.repository.ReviewRepository;
import com.sneakx.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         ProductRepository productRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> getReviewsForProduct(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(this::mapToReviewDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDto addReview(Long userId, Long productId, CreateReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Boolean isVerified = reviewRepository.hasUserPurchasedProduct(userId, productId);

        Optional<Review> existingOpt = reviewRepository.findByUserIdAndProductId(userId, productId);
        Review review;
        if (existingOpt.isPresent()) {
            review = existingOpt.get();
            review.setRating(request.getRating());
            review.setTitle(request.getTitle());
            review.setComment(request.getComment());
            review.setIsVerifiedPurchase(isVerified);
        } else {
            review = new Review(user, product, request.getRating(), request.getTitle(), request.getComment(), isVerified);
        }

        Review saved = reviewRepository.save(review);
        return mapToReviewDto(saved);
    }

    private ReviewDto mapToReviewDto(Review r) {
        return new ReviewDto(
                r.getId(),
                r.getProduct().getId(),
                r.getUser() != null ? r.getUser().getFullName() : "Customer",
                r.getRating(),
                r.getTitle(),
                r.getComment(),
                r.getIsVerifiedPurchase(),
                r.getCreatedAt()
        );
    }
}
