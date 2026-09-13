package com.sneakx.service;

import com.sneakx.dto.SizeAdvisorRequest;
import com.sneakx.dto.SizeAdvisorResponse;
import com.sneakx.entity.Product;
import com.sneakx.exception.ResourceNotFoundException;
import com.sneakx.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class SizeAdvisorService {

    private final ProductRepository productRepository;

    // Brand baseline offset against universal true-to-size (TTS = 0.0)
    // Positive offset means the shoe fits tight/small, so you need a larger size (+0.5)
    // Negative offset means the shoe fits large/roomy, so you need a smaller size (-0.5)
    private static final Map<String, Double> BRAND_OFFSETS = new HashMap<>();

    static {
        BRAND_OFFSETS.put("nike", 0.0);       // Baseline TTS
        BRAND_OFFSETS.put("jordan", 0.0);     // Baseline TTS
        BRAND_OFFSETS.put("adidas", 0.0);     // Generally TTS
        BRAND_OFFSETS.put("yeezy", 0.5);      // Runs 0.5 size small, recommend half size up
        BRAND_OFFSETS.put("converse", -0.5);  // Runs 0.5 size large, recommend half size down
        BRAND_OFFSETS.put("new balance", 0.0);// Baseline TTS
        BRAND_OFFSETS.put("puma", 0.0);       // Baseline TTS
        BRAND_OFFSETS.put("vans", 0.0);       // Baseline TTS
    }

    public SizeAdvisorService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public SizeAdvisorResponse calculateRecommendedSize(SizeAdvisorRequest request) {
        Product targetProduct = productRepository.findById(request.getTargetProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getTargetProductId()));

        String targetBrandName = targetProduct.getBrand() != null ? targetProduct.getBrand().getName().toLowerCase() : "nike";
        String referenceBrand = request.getReferenceBrand().trim().toLowerCase();

        double targetOffset = BRAND_OFFSETS.getOrDefault(targetBrandName, 0.0);
        double referenceOffset = BRAND_OFFSETS.getOrDefault(referenceBrand, 0.0);

        // Net size delta needed for the target sneaker
        double netAdjustment = targetOffset - referenceOffset;
        double recommended = request.getReferenceSize().doubleValue() + netAdjustment;

        // Round to nearest 0.5 shoe size
        recommended = Math.round(recommended * 2.0) / 2.0;

        String fitType;
        String fitNote;
        String explanation;

        if (netAdjustment > 0) {
            fitType = "RUNS_SMALL";
            fitNote = String.format("%s typically runs half a size small compared to %s. We recommend sizing up by +%.1f.",
                    targetProduct.getName(), request.getReferenceBrand(), netAdjustment);
            explanation = String.format("Based on community fit testing, %s fits snugger through the forefoot. Sizing up from your usual US %.1f to US %.1f provides optimal comfort.",
                    targetProduct.getName(), request.getReferenceSize().doubleValue(), recommended);
        } else if (netAdjustment < 0) {
            fitType = "RUNS_LARGE";
            fitNote = String.format("%s typically runs half a size roomy compared to %s. We recommend sizing down by %.1f.",
                    targetProduct.getName(), request.getReferenceBrand(), Math.abs(netAdjustment));
            explanation = String.format("This silhouette has a relaxed toe-box. Sizing down from your usual US %.1f to US %.1f ensures a snug, secure lock-down.",
                    request.getReferenceSize().doubleValue(), recommended);
        } else {
            fitType = "TRUE_TO_SIZE";
            fitNote = String.format("%s fits True to Size (TTS) relative to your %s footwear.",
                    targetProduct.getName(), request.getReferenceBrand());
            explanation = String.format("You should stick to your standard US %.1f size. Sizing matches closely with %s fit profiles.",
                    recommended, request.getReferenceBrand());
        }

        return new SizeAdvisorResponse(BigDecimal.valueOf(recommended), fitType, fitNote, explanation);
    }
}
