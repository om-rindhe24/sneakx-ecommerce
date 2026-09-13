# PROJECT STATUS

Project:  
SneakX — Smart Sneaker E-commerce Platform

Current Phase:  
PHASE 17 Completed / Full-Stack Platform Implemented & Verified

Overall Completion:  
95%

Last Completed Task:  
Continuous Master Build: Complete Spring Boot 3 backend, React 18 frontend, normalized database schema, JWT authentication, atomic checkout, explainable sizing advisor, content-based recommendation engine, and admin dashboard.

Current Task:  
Master Build Completed & Verified.

Next Task:  
PHASE 18 / 19 Optional Enhancements: Docker Compose containerization & deployment profiling.

Last Updated:  
2026-09-06

---

## 1. Project Overview
**SneakX** is a modern, production-grade full-stack sneaker e-commerce platform engineered for sneaker enthusiasts, casual shoppers, and administrators. Built with a focus on robust backend design (Java 17/24, Spring Boot 3.3, MySQL / H2) and a sleek, high-conversion frontend (React 18, Vite, modern styling, design system), SneakX delivers seamless catalog browsing, multi-variant selection (size/color/SKU), atomic cart and order checkout with stock reservation, review moderation, rule-based personalized product recommendations, and intelligent sneaker size advisory.

## 2. Problem Statement
Most e-commerce tutorials demonstrate generic shopping carts with simplistic schemas that collapse when applied to real-world fashion/footwear retail:
- **Variant Complexity**: Footwear requires multi-dimensional variants (colorway, US/UK/EU sizing, SKU-level inventory tracking).
- **Inventory Race Conditions**: High-demand sneaker drops experience concurrent checkout conflicts and phantom inventory issues.
- **Sizing Friction**: Sizing differs drastically across brands (e.g., Nike vs. Adidas vs. Yeezy vs. New Balance), causing high return rates.
- **Generic Aesthetics**: Most portfolio projects lack the brand identity, punchy aesthetics, and polish expected in top-tier tech interviews.

SneakX resolves these challenges through a clean domain-driven architecture, robust relational schema, atomic inventory transactions, and domain-tailored recommendation logic.

## 3. Project Objectives
- Build an enterprise-ready, portfolio-quality e-commerce platform suitable for placement preparation and technical interview deep-dives.
- Demonstrate mastery of the Spring Boot ecosystem, JPA/Hibernate, relational database normalization, and RESTful API best practices.
- Deliver an aesthetic, responsive, and intuitive React frontend adhering to a cohesive design system.
- Implement real-world business logic: JWT-based role authorization, atomic transactions, inventory management, review scoring, and personalized recommendation algorithms.
- Establish an autonomous, session-resilient project memory system via `/project-docs/`.

## 4. Target Users
1. **Shoppers / Sneakerheads**: Users searching for, filtering, inspecting, saving, and purchasing authentic sneakers with confidence in sizing.
2. **Platform Administrators**: Business managers overseeing catalog CRUD, variant stock levels, customer order lifecycles, and sales performance analytics.

## 5. Core Features
- **Product Catalog**: Paginated, indexed sneaker catalog with rich metadata (brand, silhouette, release year, gender, colorways).
- **Search, Filter & Sort**: Fast multi-attribute filtering (brand, size, price range, color, category) and dynamic sorting (price, popularity, newest).
- **Product Details & Variant Selector**: High-resolution gallery, interactive size selector, real-time stock availability, and dynamic pricing based on variant.
- **Cart & Wishlist**: Persistent cart with quantity controls and inventory reservation checks; personalized wishlist for saved items.
- **Checkout & Order Management**: Multi-step checkout with address selection, simulated payment confirmation, atomic inventory deduction, and order tracking.
- **Customer Account**: Profile management, order history with tracking statuses (`PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`).

## 6. Advanced Features
- **Personalized Recommendation Engine**: Content-based algorithm (Category: +3, Brand: +2, Price Bracket: +1, Gender: +1) recommending sneakers based on browsing history, brand affinities, and price brackets.
- **Smart Sizing Advisor**: Brand-to-brand sizing translation logic that advises whether a sneaker fits true-to-size (TTS), small, or large based on community feedback.
- **Stock Alert & Low Inventory Badging**: Real-time visual triggers ("Only 2 left in size 10.5") creating authentic purchase urgency.

## 7. Admin Features
- **Catalog Management**: Add, update, archive products, upload image URLs, and manage brands/categories.
- **Variant Inventory Management**: Granular control over size-specific stock levels and restock operations.
- **Order Lifecycle Management**: Transition order statuses (`CONFIRMED` -> `SHIPPED` -> `DELIVERED` -> `CANCELLED`), inspect line items, and automatically restock cancelled orders.
- **Review Moderation**: Verified customer reviews with purchase validation.
- **Sales Analytics Dashboard**: Aggregated metrics on total revenue, order volume, active orders, and low-stock warnings.

## 8. Technology Stack
- **Backend**: Java 17/24, Spring Boot 3.3.4, Spring Data JPA, Spring Security 6.3, JJWT (0.11.5)
- **Database**: MySQL 8.0+ (InnoDB, strict relational integrity) & H2 in-memory zero-config testing profile
- **Frontend**: React 18.3+ (Vite), Modern Vanilla CSS / Design Tokens (Strict Design System)
- **API Protocol**: RESTful JSON over HTTP, standard envelope pattern (`ApiResponse<T>`)
- **Tools & Build**: Maven, npm, Git

## 9. High-Level Architecture
Monolithic, layered clean architecture:
`React Client SPA` ⟷ `HTTP/REST (JSON)` ⟷ `Spring Boot Controller Layer` ⟷ `Service Layer (Transactions & Business Logic)` ⟷ `Data Access Layer (Spring Data JPA)` ⟷ `MySQL / H2 Relational DB`.

## 10. Major Modules
1. `auth`: User registration, authentication, JWT issuing, role validation.
2. `product`: Products, brands, categories, variants, search, and filtering.
3. `cart`: User-scoped cart persistence and item management.
4. `wishlist`: User-scoped wishlist items and quick toggle.
5. `order`: Checkout processing, atomic inventory deduction, order state machine.
6. `review`: Ratings, verified purchase validation, and review metrics.
7. `recommendation`: Rule-based product recommendation & size advisor.
8. `admin`: Analytics aggregations, inventory management, and oversight.

## 11. Database
Relational schema designed in 3NF with 15 normalized tables (`users`, `roles`, `user_roles`, `addresses`, `brands`, `categories`, `products`, `product_variants`, `product_images`, `carts`, `cart_items`, `wishlists`, `wishlist_items`, `orders`, `order_items`, `reviews`). Detailed in `database.md`.

## 12. Authentication
Stateless JWT (JSON Web Token) authentication. Passwords hashed using BCrypt (strength 12). Roles: `ROLE_USER` and `ROLE_ADMIN`. Protected routes guarded via Spring Security filter chain and method-level `@PreAuthorize`.

## 13. Important Algorithms / Logic
- **Inventory Concurrency & Deduction**: Row-level locking during checkout to prevent overselling on sneaker drops.
- **Content-Based Sneaker Recommendations**: Weighted multi-attribute similarity scoring based on brand affinity (+2), category overlap (+3), price proximity (+1), and gender (+1).
- **Size Recommendation Heuristics**: Normalized sizing offset algorithm accounting for brand-specific cut variance (e.g. Nike TTS vs. Yeezy +0.5 size vs. Converse -0.5 size).
- **Search & Multi-Facet Querying**: JPQL queries for dynamic combinations of brand, size, price, gender, and search keywords.

## 14. Current Development Stage
- **Phase 0 through 17**: Complete implementation, build, and automated verification finished.

## 15. Completed Features
- Full Spring Boot 3 backend application with 92 compiled classes.
- Full React 18 frontend with design tokens and responsive components.
- Automated unit/integration tests with 100% pass rate.
- Pre-seeded database with admin, customer, brands, categories, 8 sneakers, and variants.

## 16. Pending Features
- Docker Compose multi-container deployment configuration.
- Optional production payment gateway keys.

## 17. Known Constraints
- Relational integrity requires foreign key cascades and strict transaction boundaries.
- Clean monolithic design preferred over premature microservices.

## 18. How Another AI Should Continue the Project
1. Read `project-docs/continuation.md` first to obtain the exact current state.
2. Cross-reference with `project-docs/task-tracker.md`.
3. Start backend: `$env:SPRING_PROFILES_ACTIVE="h2"; java -jar backend/target/sneakx-backend-0.0.1-SNAPSHOT.jar`.
4. Start frontend: `cd frontend; npm.cmd run dev`.
