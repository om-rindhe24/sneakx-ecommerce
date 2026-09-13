package com.sneakx.service;

import com.sneakx.dto.*;
import com.sneakx.entity.Brand;
import com.sneakx.entity.Category;
import com.sneakx.entity.Product;
import com.sneakx.entity.ProductVariant;
import com.sneakx.exception.ResourceNotFoundException;
import com.sneakx.repository.BrandRepository;
import com.sneakx.repository.CategoryRepository;
import com.sneakx.repository.ProductRepository;
import com.sneakx.repository.ReviewRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;

    public ProductService(ProductRepository productRepository,
                          BrandRepository brandRepository,
                          CategoryRepository categoryRepository,
                          ReviewRepository reviewRepository) {
        this.productRepository = productRepository;
        this.brandRepository = brandRepository;
        this.categoryRepository = categoryRepository;
        this.reviewRepository = reviewRepository;
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> getFilteredProducts(Long brandId, String brand, Long categoryId, String category, BigDecimal minPrice, BigDecimal maxPrice,
                                                String gender, BigDecimal size, String search, String sortStr, int page, int pageSize) {
        if (brandId == null && brand != null && !brand.trim().isEmpty()) {
            brandId = brandRepository.findBySlug(brand.trim().toLowerCase())
                    .or(() -> brandRepository.findByNameIgnoreCase(brand.trim()))
                    .map(Brand::getId)
                    .orElse(-1L);
        }

        if (categoryId == null && category != null && !category.trim().isEmpty()) {
            categoryId = categoryRepository.findBySlug(category.trim().toLowerCase())
                    .or(() -> categoryRepository.findByNameIgnoreCase(category.trim()))
                    .map(Category::getId)
                    .orElse(-1L);
        }

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("price_asc".equalsIgnoreCase(sortStr)) {
            sort = Sort.by(Sort.Direction.ASC, "basePrice");
        } else if ("price_desc".equalsIgnoreCase(sortStr)) {
            sort = Sort.by(Sort.Direction.DESC, "basePrice");
        } else if ("newest".equalsIgnoreCase(sortStr)) {
            sort = Sort.by(Sort.Direction.DESC, "createdAt");
        } else if ("name_asc".equalsIgnoreCase(sortStr)) {
            sort = Sort.by(Sort.Direction.ASC, "name");
        } else if ("name_desc".equalsIgnoreCase(sortStr)) {
            sort = Sort.by(Sort.Direction.DESC, "name");
        }

        Pageable pageable = PageRequest.of(page, pageSize, sort);
        Page<Product> productPage = productRepository.findFiltered(brandId, categoryId, minPrice, maxPrice, gender, size, search, pageable);

        return productPage.map(this::mapToProductDto);
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> getFilteredProducts(Long brandId, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice,
                                                String gender, BigDecimal size, String search, String sortStr, int page, int pageSize) {
        return getFilteredProducts(brandId, null, categoryId, null, minPrice, maxPrice, gender, size, search, sortStr, page, pageSize);
    }

    @Transactional(readOnly = true)
    public ProductDetailDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapToProductDetailDto(product);
    }

    @Transactional(readOnly = true)
    public ProductDetailDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "slug", slug));
        return mapToProductDetailDto(product);
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrueAndIsActiveTrue().stream()
                .map(this::mapToProductDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getNewReleases() {
        return productRepository.findTop8ByIsActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::mapToProductDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BrandDto> getAllBrands() {
        return brandRepository.findAll().stream()
                .map(b -> new BrandDto(b.getId(), b.getName(), b.getSlug(), b.getLogoUrl()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> new CategoryDto(c.getId(), c.getName(), c.getSlug(), c.getDescription()))
                .collect(Collectors.toList());
    }

    public ProductDto mapToProductDto(Product p) {
        ProductDto dto = new ProductDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setSlug(p.getSlug());
        dto.setBrandName(p.getBrand() != null ? p.getBrand().getName() : "");
        dto.setBrandId(p.getBrand() != null ? p.getBrand().getId() : null);
        dto.setCategoryName(p.getCategory() != null ? p.getCategory().getName() : "");
        dto.setCategoryId(p.getCategory() != null ? p.getCategory().getId() : null);
        dto.setBasePrice(p.getBasePrice());
        dto.setColorway(p.getColorway());
        dto.setGender(p.getGender());
        dto.setIsFeatured(p.getIsFeatured());
        dto.setPrimaryImageUrl(p.getPrimaryImageUrl());
        dto.setAverageRating(p.getAverageRating());
        dto.setReviewCount(p.getReviews() != null ? p.getReviews().size() : 0);

        if (p.getVariants() != null) {
            dto.setVariants(p.getVariants().stream()
                    .map(this::mapToVariantDto)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    public ProductDetailDto mapToProductDetailDto(Product p) {
        ProductDetailDto dto = new ProductDetailDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setSlug(p.getSlug());
        dto.setDescription(p.getDescription());
        dto.setBrandName(p.getBrand() != null ? p.getBrand().getName() : "");
        dto.setBrandId(p.getBrand() != null ? p.getBrand().getId() : null);
        dto.setCategoryName(p.getCategory() != null ? p.getCategory().getName() : "");
        dto.setCategoryId(p.getCategory() != null ? p.getCategory().getId() : null);
        dto.setBasePrice(p.getBasePrice());
        dto.setColorway(p.getColorway());
        dto.setGender(p.getGender());
        dto.setIsFeatured(p.getIsFeatured());
        dto.setPrimaryImageUrl(p.getPrimaryImageUrl());
        dto.setAverageRating(p.getAverageRating());
        dto.setReviewCount(p.getReviews() != null ? p.getReviews().size() : 0);

        if (p.getVariants() != null) {
            dto.setVariants(p.getVariants().stream()
                    .map(this::mapToVariantDto)
                    .collect(Collectors.toList()));
        }

        if (p.getImages() != null) {
            dto.setImages(p.getImages().stream()
                    .map(img -> new ProductImageDto(img.getId(), img.getImageUrl(), img.getIsPrimary(), img.getDisplayOrder()))
                    .collect(Collectors.toList()));
        }

        if (p.getReviews() != null) {
            dto.setReviews(p.getReviews().stream()
                    .map(r -> new ReviewDto(
                            r.getId(),
                            p.getId(),
                            r.getUser() != null ? r.getUser().getFullName() : "Verified Customer",
                            r.getRating(),
                            r.getTitle(),
                            r.getComment(),
                            r.getIsVerifiedPurchase(),
                            r.getCreatedAt()
                    ))
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public ProductVariantDto mapToVariantDto(ProductVariant v) {
        return new ProductVariantDto(
                v.getId(),
                v.getSize(),
                v.getSku(),
                v.getStockQuantity(),
                v.getPriceAdjustment(),
                v.getEffectivePrice()
        );
    }
}
