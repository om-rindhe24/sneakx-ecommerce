package com.sneakx;

import com.sneakx.dto.SizeAdvisorRequest;
import com.sneakx.dto.SizeAdvisorResponse;
import com.sneakx.entity.Brand;
import com.sneakx.entity.Product;
import com.sneakx.repository.ProductRepository;
import com.sneakx.service.SizeAdvisorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class SizeAdvisorServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private SizeAdvisorService sizeAdvisorService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRecommendSize_YeezyTarget_NikeReference_ShouldSizeUpHalf() {
        Product yeezy = new Product();
        yeezy.setName("Yeezy 350 V2");
        yeezy.setBrand(new Brand("Yeezy", "yeezy", ""));

        when(productRepository.findById(3L)).thenReturn(Optional.of(yeezy));

        SizeAdvisorRequest request = new SizeAdvisorRequest();
        request.setTargetProductId(3L);
        request.setReferenceBrand("Nike");
        request.setReferenceSize(BigDecimal.valueOf(10.0));

        SizeAdvisorResponse response = sizeAdvisorService.calculateRecommendedSize(request);

        assertNotNull(response);
        assertEquals(BigDecimal.valueOf(10.5), response.getRecommendedSize());
        assertEquals("RUNS_SMALL", response.getFitType());
    }

    @Test
    void testRecommendSize_ConverseTarget_NikeReference_ShouldSizeDownHalf() {
        Product converse = new Product();
        converse.setName("Chuck 70 High");
        converse.setBrand(new Brand("Converse", "converse", ""));

        when(productRepository.findById(6L)).thenReturn(Optional.of(converse));

        SizeAdvisorRequest request = new SizeAdvisorRequest();
        request.setTargetProductId(6L);
        request.setReferenceBrand("Nike");
        request.setReferenceSize(BigDecimal.valueOf(10.0));

        SizeAdvisorResponse response = sizeAdvisorService.calculateRecommendedSize(request);

        assertNotNull(response);
        assertEquals(BigDecimal.valueOf(9.5), response.getRecommendedSize());
        assertEquals("RUNS_LARGE", response.getFitType());
    }

    @Test
    void testRecommendSize_JordanTarget_NikeReference_ShouldBeTTS() {
        Product jordan = new Product();
        jordan.setName("Air Jordan 1");
        jordan.setBrand(new Brand("Jordan", "jordan", ""));

        when(productRepository.findById(1L)).thenReturn(Optional.of(jordan));

        SizeAdvisorRequest request = new SizeAdvisorRequest();
        request.setTargetProductId(1L);
        request.setReferenceBrand("Nike");
        request.setReferenceSize(BigDecimal.valueOf(10.0));

        SizeAdvisorResponse response = sizeAdvisorService.calculateRecommendedSize(request);

        assertNotNull(response);
        assertEquals(BigDecimal.valueOf(10.0), response.getRecommendedSize());
        assertEquals("TRUE_TO_SIZE", response.getFitType());
    }
}
