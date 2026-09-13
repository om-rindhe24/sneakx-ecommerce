package com.sneakx.repository;

import com.sneakx.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySlug(String slug);

    List<Product> findByIsFeaturedTrueAndIsActiveTrue();

    List<Product> findTop8ByIsActiveTrueOrderByCreatedAtDesc();

    @Query(value = "SELECT p FROM Product p " +
           "WHERE p.isActive = true " +
           "AND (:brandId IS NULL OR p.brand.id = :brandId) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:minPrice IS NULL OR p.basePrice >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.basePrice <= :maxPrice) " +
           "AND (:gender IS NULL OR :gender = '' OR LOWER(p.gender) = LOWER(:gender)) " +
           "AND (:size IS NULL OR p.id IN (SELECT pv.product.id FROM ProductVariant pv WHERE pv.size = :size)) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "     LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(p.brand.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(p.colorway) LIKE LOWER(CONCAT('%', :search, '%')))",
           countQuery = "SELECT COUNT(p) FROM Product p " +
           "WHERE p.isActive = true " +
           "AND (:brandId IS NULL OR p.brand.id = :brandId) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:minPrice IS NULL OR p.basePrice >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.basePrice <= :maxPrice) " +
           "AND (:gender IS NULL OR :gender = '' OR LOWER(p.gender) = LOWER(:gender)) " +
           "AND (:size IS NULL OR p.id IN (SELECT pv.product.id FROM ProductVariant pv WHERE pv.size = :size)) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "     LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(p.brand.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(p.colorway) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> findFiltered(
        @Param("brandId") Long brandId,
        @Param("categoryId") Long categoryId,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("gender") String gender,
        @Param("size") BigDecimal size,
        @Param("search") String search,
        Pageable pageable
    );

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.id <> :excludeId " +
           "AND (p.brand.id = :brandId OR p.category.id = :categoryId)")
    List<Product> findSimilarProducts(
        @Param("excludeId") Long excludeId,
        @Param("brandId") Long brandId,
        @Param("categoryId") Long categoryId,
        Pageable pageable
    );
}
