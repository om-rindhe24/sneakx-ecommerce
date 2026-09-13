package com.sneakx.controller;

import com.sneakx.dto.ApiResponse;
import com.sneakx.dto.ProductDto;
import com.sneakx.dto.SizeAdvisorRequest;
import com.sneakx.dto.SizeAdvisorResponse;
import com.sneakx.security.UserPrincipal;
import com.sneakx.service.RecommendationService;
import com.sneakx.service.SizeAdvisorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final SizeAdvisorService sizeAdvisorService;

    public RecommendationController(RecommendationService recommendationService,
                                    SizeAdvisorService sizeAdvisorService) {
        this.recommendationService = recommendationService;
        this.sizeAdvisorService = sizeAdvisorService;
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getSimilarProducts(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "4") int limit
    ) {
        List<ProductDto> similar = recommendationService.getSimilarProducts(productId, limit);
        return ResponseEntity.ok(ApiResponse.success("Similar product recommendations retrieved", similar));
    }

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getUserRecommendations(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "4") int limit
    ) {
        Long userId = principal != null ? principal.getId() : null;
        if (userId == null) {
            return ResponseEntity.ok(ApiResponse.success("Featured recommendations retrieved", recommendationService.getSimilarProducts(1L, limit)));
        }
        List<ProductDto> recommendations = recommendationService.getPersonalizedRecommendationsForUser(userId, limit);
        return ResponseEntity.ok(ApiResponse.success("Personalized recommendations retrieved", recommendations));
    }

    @PostMapping("/size-advisor")
    public ResponseEntity<ApiResponse<SizeAdvisorResponse>> getRecommendedSize(@Valid @RequestBody SizeAdvisorRequest request) {
        SizeAdvisorResponse advice = sizeAdvisorService.calculateRecommendedSize(request);
        return ResponseEntity.ok(ApiResponse.success("Size recommendation calculated", advice));
    }
}
