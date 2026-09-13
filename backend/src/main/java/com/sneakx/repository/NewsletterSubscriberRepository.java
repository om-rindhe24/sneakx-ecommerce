package com.sneakx.repository;

import com.sneakx.entity.NewsletterSubscriber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface NewsletterSubscriberRepository extends JpaRepository<NewsletterSubscriber, Long> {
    boolean existsByEmailIgnoreCase(String email);
    Optional<NewsletterSubscriber> findByEmailIgnoreCase(String email);
}
