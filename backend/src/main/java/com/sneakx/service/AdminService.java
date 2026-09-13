package com.sneakx.service;

import com.sneakx.dto.*;
import com.sneakx.entity.*;
import com.sneakx.exception.BadRequestException;
import com.sneakx.exception.ResourceNotFoundException;
import com.sneakx.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductService productService;
    private final OrderService orderService;

    public AdminService(ProductRepository productRepository,
                        ProductVariantRepository variantRepository,
                        BrandRepository brandRepository,
                        CategoryRepository categoryRepository,
                        OrderRepository orderRepository,
                        UserRepository userRepository,
                        ProductService productService,
                        OrderService orderService) {
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.brandRepository = brandRepository;
        this.categoryRepository = categoryRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productService = productService;
        this.orderService = orderService;
    }

    @Transactional(readOnly = true)
    public AdminStatsDto getDashboardStats() {
        AdminStatsDto stats = new AdminStatsDto();
        stats.setTotalProducts(productRepository.count());
        stats.setTotalUsers(userRepository.count());
        stats.setTotalOrders(orderRepository.countTotalOrders());
        stats.setActiveOrders(orderRepository.countActiveOrders());
        stats.setTotalRevenue(orderRepository.calculateTotalRevenue());

        List<ProductVariant> lowStock = variantRepository.findLowStockVariants(5);
        stats.setLowStockAlerts(lowStock.stream()
                .map(productService::mapToVariantDto)
                .collect(Collectors.toList()));

        return stats;
    }

    @Transactional
    public ProductDetailDto createProduct(CreateProductRequest request) {
        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", request.getBrandId()));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        String slug = request.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-") + "-" + System.currentTimeMillis() % 10000;

        Product product = new Product();
        product.setName(request.getName());
        product.setSlug(slug);
        product.setBrand(brand);
        product.setCategory(category);
        product.setDescription(request.getDescription());
        product.setBasePrice(request.getBasePrice());
        product.setColorway(request.getColorway());
        product.setGender(request.getGender() != null ? request.getGender() : "Unisex");
        product.setIsFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false);
        product.setIsActive(true);

        Product savedProduct = productRepository.save(product);

        // Save Variants
        if (request.getInitialVariants() != null && !request.getInitialVariants().isEmpty()) {
            List<ProductVariant> variants = new ArrayList<>();
            for (ProductVariantDto vdto : request.getInitialVariants()) {
                String sku = (vdto.getSku() != null && !vdto.getSku().isBlank())
                        ? vdto.getSku()
                        : "SKU-" + savedProduct.getId() + "-" + vdto.getSize();

                ProductVariant variant = new ProductVariant(
                        savedProduct,
                        vdto.getSize(),
                        sku,
                        vdto.getStockQuantity() != null ? vdto.getStockQuantity() : 10,
                        vdto.getPriceAdjustment() != null ? vdto.getPriceAdjustment() : BigDecimal.ZERO
                );
                variants.add(variantRepository.save(variant));
            }
            savedProduct.setVariants(variants);
        }

        // Save Images
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            List<ProductImage> images = new ArrayList<>();
            int order = 0;
            for (String url : request.getImageUrls()) {
                ProductImage img = new ProductImage(savedProduct, url, order == 0, order++);
                images.add(img);
            }
            savedProduct.setImages(images);
        }

        return productService.mapToProductDetailDto(savedProduct);
    }

    @Transactional
    public ProductDetailDto updateProduct(Long id, CreateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", request.getBrandId()));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        product.setName(request.getName());
        product.setBrand(brand);
        product.setCategory(category);
        product.setDescription(request.getDescription());
        product.setBasePrice(request.getBasePrice());
        product.setColorway(request.getColorway());
        product.setGender(request.getGender());
        product.setIsFeatured(request.getIsFeatured());

        Product saved = productRepository.save(product);
        return productService.mapToProductDetailDto(saved);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setIsActive(false); // Soft-delete
        productRepository.save(product);
    }

    @Transactional
    public ProductVariantDto updateVariantStock(Long variantId, int newStock) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", variantId));

        if (newStock < 0) {
            throw new BadRequestException("Stock quantity cannot be negative.");
        }

        variant.setStockQuantity(newStock);
        ProductVariant saved = variantRepository.save(variant);
        return productService.mapToVariantDto(saved);
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(u -> {
            List<String> roles = u.getRoles().stream().map(Role::getName).collect(Collectors.toList());
            return new UserDto(u.getId(), u.getFirstName(), u.getLastName(), u.getEmail(), u.getPhone(), roles);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> getAllOrders(Pageable pageable) {
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(orderService::mapToOrderDto);
    }
}
