package com.sneakx.repository;

import com.sneakx.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findByProductId(Long productId);

    Optional<ProductVariant> findBySku(String sku);

    Optional<ProductVariant> findByProductIdAndSize(Long productId, BigDecimal size);

    @Query("SELECT v FROM ProductVariant v WHERE v.stockQuantity <= :threshold ORDER BY v.stockQuantity ASC")
    List<ProductVariant> findLowStockVariants(@Param("threshold") Integer threshold);
}
