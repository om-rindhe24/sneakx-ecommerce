package com.sneakx.controller;

import com.sneakx.dto.*;
import com.sneakx.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<Page<ProductDto>>> getProducts(
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) BigDecimal size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int pageSize
    ) {
        Page<ProductDto> products = productService.getFilteredProducts(
                brandId, brand, categoryId, category, minPrice, maxPrice, gender, size, search, sort, page, pageSize);
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", products));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductDetailDto>> getProductById(@PathVariable Long id) {
        ProductDetailDto product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Product details retrieved", product));
    }

    @GetMapping("/products/slug/{slug}")
    public ResponseEntity<ApiResponse<ProductDetailDto>> getProductBySlug(@PathVariable String slug) {
        ProductDetailDto product = productService.getProductBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success("Product details retrieved", product));
    }

    @GetMapping("/products/featured")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getFeaturedProducts() {
        List<ProductDto> featured = productService.getFeaturedProducts();
        return ResponseEntity.ok(ApiResponse.success("Featured products retrieved", featured));
    }

    @GetMapping("/products/new-releases")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getNewReleases() {
        List<ProductDto> newReleases = productService.getNewReleases();
        return ResponseEntity.ok(ApiResponse.success("New releases retrieved", newReleases));
    }

    @GetMapping("/brands")
    public ResponseEntity<ApiResponse<List<BrandDto>>> getBrands() {
        List<BrandDto> brands = productService.getAllBrands();
        return ResponseEntity.ok(ApiResponse.success("Brands retrieved", brands));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getCategories() {
        List<CategoryDto> categories = productService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved", categories));
    }
}
