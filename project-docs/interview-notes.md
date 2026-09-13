# SneakX — Placement & Technical Interview Guide

This document is engineered to prepare candidates to defend the architecture, engineering trade-offs, algorithms, and design choices of SneakX during technical interviews.

---

## 1. Project Explanation (The 60-Second Pitch)
"SneakX is a production-style full-stack sneaker e-commerce platform engineered with Spring Boot, MySQL, and React. Unlike standard tutorial shopping carts, SneakX addresses real-world retail challenges specific to footwear: multi-attribute SKU variants (sizes, colorways), atomic inventory concurrency during high-heat drops to eliminate overselling, a rule-based sneaker recommendation engine, and a brand-to-brand sizing advisor that resolves the industry's biggest return issue: sizing variance across brands."

---

## 2. Why This Project Was Selected
- **Domain Complexity**: Footwear retail requires complex relational modeling (parent sneaker model vs. distinct child size SKUs) and transactional concurrency handling.
- **Enterprise Alignment**: Enterprise companies (fintech, e-commerce, software services) heavily favor Java and Spring Boot for high-throughput transactional backends.
- **Full-Stack Proficiency**: Bridges the gap between robust backend systems (JPA, transactions, Spring Security) and modern, aesthetic React SPAs.

---

## 3. Technology Choices & Justifications
- **Java 17 & Spring Boot 3**: Chosen for strong typing, mature ecosystem, automated dependency injection, declarative transactions (`@Transactional`), and production-ready connection pooling via HikariCP.
- **MySQL 8 (InnoDB)**: Chosen for strict ACID compliance, row-level locking (`SELECT ... FOR UPDATE`), and foreign key enforcement needed for financial and inventory accuracy.
- **React (Vite)**: Fast client-side rendering with pure CSS tokens for bespoke sneakerhead branding without third-party CSS bloat.
- **Stateless JWT**: Decouples API from server-side session storage, enabling lightweight horizontal scalability.

---

## 4. Architecture Explanation
- **Layered Monolith**:
  - `Controller`: Handles HTTP routing, converts DTOs, enforces Bean Validation (`@Valid`), returns uniform `ApiResponse<T>`.
  - `Service`: Contains business rules, orchestration, and `@Transactional` boundaries.
  - `Repository`: Leverages Spring Data JPA with derived queries, JPQL, and Specifications.
  - `Entity`: JPA mappings to normalized 3NF MySQL tables.

---

## 5. Database Schema & Relational Design
- **3NF Normalization**: 15 distinct tables (`users`, `roles`, `products`, `product_variants`, `orders`, `order_items`, `carts`, `wishlists`, etc.).
- **Variant Modeling**: Rather than storing inventory on the `products` table, physical stock is tracked on `product_variants` (each with its own `size`, `sku`, and `stock_quantity`).
- **Immutable Order Snapshots**: `order_items` stores historical snapshots of sneaker name, size, and price at time of purchase, insulating past orders from future price or catalog edits.

---

## 6. Authentication & Security Rationale
- Passwords hashed using **BCrypt** with salt rounds = 12.
- Authentication filter (`JwtAuthenticationFilter`) executes before Spring Security's `UsernamePasswordAuthenticationFilter`.
- Roles (`ROLE_USER`, `ROLE_ADMIN`) embedded directly into JWT claims to eliminate redundant database queries on every authenticated request.

---

## 7. High-Yield Interview Questions & Direct Answers

### Q1: How do you prevent two users from buying the last sneaker in size 10.5 simultaneously?
**Answer**:  
"We manage inventory at the `product_variants` level using database-level locking inside an atomic `@Transactional` service method. When checking out, we execute a selective update:  
`UPDATE product_variants SET stock_quantity = stock_quantity - :qty WHERE id = :variantId AND stock_quantity >= :qty;`  
If the rows affected is 0, it means another thread acquired the unit first; the transaction immediately rolls back and throws an `InsufficientStockException`."

### Q2: Why did you separate Product and ProductVariant into two entities?
**Answer**:  
"In footwear, a sneaker model like 'Air Jordan 1' shares images, brand, description, and release year. However, stock, SKUs, and pricing adjustments are specific to individual sizes. Flattening sizes into an array or JSON column violates 1NF and prevents relational indexing on size or atomic stock updates per size."

### Q3: Why did you use JWT instead of standard HTTP sessions?
**Answer**:  
"JWTs provide stateless authentication. The Spring Boot backend doesn't need to maintain a shared session store (like Redis) or session sticky routing. The React client stores the token and passes it in the `Authorization: Bearer` header, allowing the backend to authenticate requests via cryptographic signature verification in memory."

### Q4: How does your recommendation system work without heavy ML libraries?
**Answer**:  
"We use a deterministic, explainable content-based similarity algorithm. Each sneaker has attribute vectors: brand ID, category ID, and normalized price range. For a target product, we compute a weighted affinity score across the catalog:  
`Score = (w1 * BrandMatch) + (w2 * CategoryMatch) + (w3 * PriceProximity)`.  
This runs in sub-10 milliseconds in Java, requires zero external Python dependencies, and provides transparent reasons for recommendations."

### Q5: How do you handle N+1 query problems in Spring Data JPA?
**Answer**:  
"By default, relational associations like `@OneToMany` are configured with `FetchType.LAZY`. When fetching products with their primary images or variants, we use JPQL `JOIN FETCH` queries or `@EntityGraph` to fetch the required graph in a single SQL query, preventing Hibernate from firing N additional select queries."

### Q6: Why did joining variants directly in the catalog query break pagination, and how did you resolve it?
**Answer**:  
"In Hibernate and Spring Data JPA, executing `Pageable` with `LIMIT` and `OFFSET` on a query that outer joins a `@OneToMany` collection (`Product` to `ProductVariant`) causes row multiplication in SQL. Hibernate is forced to either paginate in memory (`HHH000104`) or miscalculate page totals. We solved this at the root cause by removing the collection join from the main query and filtering sizes via a correlated subquery:  
`(:size IS NULL OR p.id IN (SELECT pv.product.id FROM ProductVariant pv WHERE pv.size = :size))`  
along with an explicit `countQuery`. This ensures every product row is evaluated exactly once in SQL without duplicate overhead."

### Q7: How does SneakX handle payment security and PCI-DSS compliance?
**Answer**:  
"SneakX strictly follows the principle of zero sensitive credential persistence. Raw card numbers, CVVs, and private UPI credentials are never stored in the database. In a production deployment, frontend tokens (e.g. Stripe Elements or Razorpay Checkout) are exchanged for payment gateway references. In our sandbox demo, the client validates inputs, simulates gateway latency and authorization, and sends only the `paymentMethod`, `paymentStatus`, and a unique `paymentReference` to the backend. Order creation occurs strictly after payment authorization succeeds."

### Q8: How is the order confirmation email structured to avoid application crashes?
**Answer**:  
"We built a configurable `EmailService` utilizing Spring Mail's `JavaMailSender`. The service accepts SMTP configuration dynamically from environment variables (`MAIL_HOST`, `MAIL_PORT`, etc.). If credentials are not present, the service transparently shifts to a development fallback mode that formats the HTML email receipt and logs a structured ASCII summary to the server console. Furthermore, email dispatch is isolated in a try-catch block during checkout so that a transient network failure in the mail server will never roll back a successfully confirmed order."
