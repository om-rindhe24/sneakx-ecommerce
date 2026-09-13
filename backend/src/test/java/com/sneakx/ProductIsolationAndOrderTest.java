package com.sneakx;

import com.sneakx.dto.ApiResponse;
import com.sneakx.dto.ProductDto;
import com.sneakx.controller.ProductController;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("h2")
@Transactional
public class ProductIsolationAndOrderTest {

    @Autowired
    private ProductController productController;

    @Test
    @DisplayName("Brand Isolation: Nike section must contain 100% Nike products")
    void testNikeBrandIsolation() {
        ResponseEntity<ApiResponse<Page<ProductDto>>> response = productController.getProducts(
                null, "Nike", null, null, null, null, null, null, null, "newest", 0, 50
        );

        assertNotNull(response.getBody());
        Page<ProductDto> page = response.getBody().getData();
        List<ProductDto> products = page.getContent();

        assertFalse(products.isEmpty(), "Nike products must not be empty");
        for (ProductDto p : products) {
            assertEquals("Nike", p.getBrandName(), "Every product must belong strictly to Nike: " + p.getName());
        }
    }

    @Test
    @DisplayName("Brand Isolation: Jordan section must contain 100% Jordan products")
    void testJordanBrandIsolation() {
        ResponseEntity<ApiResponse<Page<ProductDto>>> response = productController.getProducts(
                null, "Jordan", null, null, null, null, null, null, null, "newest", 0, 50
        );

        assertNotNull(response.getBody());
        Page<ProductDto> page = response.getBody().getData();
        List<ProductDto> products = page.getContent();

        assertFalse(products.isEmpty(), "Jordan products must not be empty");
        for (ProductDto p : products) {
            assertEquals("Jordan", p.getBrandName(), "Every product must belong strictly to Jordan: " + p.getName());
        }
    }

    @Test
    @DisplayName("Brand Isolation: Adidas section must contain 100% Adidas products")
    void testAdidasBrandIsolation() {
        ResponseEntity<ApiResponse<Page<ProductDto>>> response = productController.getProducts(
                null, "Adidas", null, null, null, null, null, null, null, "newest", 0, 50
        );

        assertNotNull(response.getBody());
        Page<ProductDto> page = response.getBody().getData();
        List<ProductDto> products = page.getContent();

        assertFalse(products.isEmpty(), "Adidas products must not be empty");
        for (ProductDto p : products) {
            assertEquals("Adidas", p.getBrandName(), "Every product must belong strictly to Adidas: " + p.getName());
        }
    }

    @Test
    @DisplayName("Brand + Category Isolation: Jordan + Basketball must return ONLY Jordan Basketball products")
    void testBrandAndCategoryIsolation() {
        ResponseEntity<ApiResponse<Page<ProductDto>>> response = productController.getProducts(
                null, "Jordan", null, "Basketball", null, null, null, null, null, "newest", 0, 50
        );

        assertNotNull(response.getBody());
        Page<ProductDto> page = response.getBody().getData();
        List<ProductDto> products = page.getContent();

        assertFalse(products.isEmpty(), "Jordan Basketball products must not be empty");
        for (ProductDto p : products) {
            assertEquals("Jordan", p.getBrandName(), "Must be Jordan: " + p.getName());
            assertEquals("Basketball", p.getCategoryName(), "Must be Basketball: " + p.getName());
        }
    }

    @Test
    @DisplayName("Brand + Search Isolation: Jordan + search='1' must NEVER return Nike products containing '1'")
    void testBrandAndSearchIsolation() {
        ResponseEntity<ApiResponse<Page<ProductDto>>> response = productController.getProducts(
                null, "Jordan", null, null, null, null, null, null, "1", "newest", 0, 50
        );

        assertNotNull(response.getBody());
        Page<ProductDto> page = response.getBody().getData();
        List<ProductDto> products = page.getContent();

        assertFalse(products.isEmpty(), "Jordan products matching '1' must not be empty");
        for (ProductDto p : products) {
            assertEquals("Jordan", p.getBrandName(), "Search within Jordan must strictly return Jordan: " + p.getName());
            assertTrue(p.getName().toLowerCase().contains("1") || p.getColorway().toLowerCase().contains("1"),
                    "Product must match search query '1': " + p.getName());
        }
    }

    @Test
    @DisplayName("Brand + Sort: Sorting must preserve brand isolation")
    void testBrandAndSortIsolation() {
        ResponseEntity<ApiResponse<Page<ProductDto>>> response = productController.getProducts(
                null, "Jordan", null, null, null, null, null, null, null, "price_asc", 0, 50
        );

        assertNotNull(response.getBody());
        Page<ProductDto> page = response.getBody().getData();
        List<ProductDto> products = page.getContent();

        assertFalse(products.isEmpty());
        for (ProductDto p : products) {
            assertEquals("Jordan", p.getBrandName());
        }

        // Verify price ordering
        for (int i = 0; i < products.size() - 1; i++) {
            BigDecimal currentPrice = products.get(i).getBasePrice();
            BigDecimal nextPrice = products.get(i + 1).getBasePrice();
            assertTrue(currentPrice.compareTo(nextPrice) <= 0, "Prices must be in ascending order");
        }
    }
}
