package com.sneakx.controller;

import com.sneakx.dto.ApiResponse;
import com.sneakx.dto.CreateReviewRequest;
import com.sneakx.dto.ReviewDto;
import com.sneakx.security.UserPrincipal;
import com.sneakx.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getProductReviews(@PathVariable Long productId) {
        List<ReviewDto> reviews = reviewService.getReviewsForProduct(productId);
        return ResponseEntity.ok(ApiResponse.success("Reviews retrieved", reviews));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewDto>> addReview(@AuthenticationPrincipal UserPrincipal principal,
                                                            @PathVariable Long productId,
                                                            @Valid @RequestBody CreateReviewRequest request) {
        ReviewDto review = reviewService.addReview(principal.getId(), productId, request);
        return new ResponseEntity<>(ApiResponse.success("Review posted successfully", review), HttpStatus.CREATED);
    }
}
