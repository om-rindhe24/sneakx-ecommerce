package com.sneakx.repository;

import com.sneakx.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);

    Optional<Review> findByUserIdAndProductId(Long userId, Long productId);

    @Query("SELECT COUNT(oi) > 0 FROM OrderItem oi " +
           "JOIN oi.order o " +
           "JOIN oi.variant v " +
           "WHERE o.user.id = :userId " +
           "AND v.product.id = :productId " +
           "AND o.status <> 'CANCELLED'")
    Boolean hasUserPurchasedProduct(@Param("userId") Long userId, @Param("productId") Long productId);
}
