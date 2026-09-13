# SneakX — Task Tracker & Development Roadmap

Status Legend:
- `[ ]` Not Started
- `[~]` In Progress
- `[x]` Completed (Implemented and Verified)

---

## PHASE 0 — Planning & Project Setup
- [x] Inspect workspace repository and determine initialization requirements
- [x] Create `/project-docs/` persistent AI memory directory
- [x] Author core documentation files (13 markdown files)
- [x] Configure root `.gitignore` for Java/Spring Boot and React/Node
- [x] Verify documentation integrity and handoff structure
- [x] Confirm local runtime environment (Java 24, Node 22, npm 10, Maven 3.9)

---

## PHASE 1 — Project Architecture & Scaffolding
- [x] Initialize Spring Boot 3.x backend project structure using Maven
- [x] Configure `pom.xml` with dependencies (Web, Security, Data JPA, MySQL, H2, JJWT, Validation)
- [x] Initialize React 18+ frontend project structure using Vite
- [x] Set up frontend folder hierarchy (`components`, `pages`, `context`, `services`, `styles`, `utils`)
- [x] Set up backend package structure (`controller`, `service`, `repository`, `entity`, `dto`, `config`, `exception`, `security`, `util`)
- [x] Create `application.yml` with MySQL and H2 profiles

---

## PHASE 2 — Database Schema & Migration
- [x] Configure connection pools and profiles in `application.yml`
- [x] Create base entity class with JPA Auditing (`id`, `createdAt`, `updatedAt`)
- [x] Implement User, Role, and UserRole entities with relational mappings
- [x] Implement Brand, Category, Product, ProductVariant, and ProductImage entities
- [x] Implement Cart, CartItem, Wishlist, and WishlistItem entities
- [x] Implement Order, OrderItem, and Address entities
- [x] Implement Review entity with verified purchase flag
- [x] Author database seeding in `DataInitializer.java` with realistic brands, silhouettes, variants, and admin accounts
- [x] Verify table generation and relational foreign key constraints

---

## PHASE 3 — Backend Foundation
- [x] Implement standardized `ApiResponse<T>` wrapper
- [x] Implement domain-specific custom exceptions (`ResourceNotFoundException`, `BadRequestException`, `InsufficientStockException`, `UnauthorizedException`)
- [x] Implement centralized `@RestControllerAdvice` (`GlobalExceptionHandler`)
- [x] Configure global Cross-Origin Resource Sharing (CORS) in `CorsConfig.java`
- [x] Implement Health Check & Version endpoint (`GET /api/health`)

---

## PHASE 4 — Authentication & Authorization
- [x] Implement User DTOs (`RegisterRequest`, `AuthRequest`, `AuthResponse`, `UserDto`)
- [x] Implement `UserRepository` and `RoleRepository`
- [x] Configure `BCryptPasswordEncoder` bean (strength 12)
- [x] Implement JWT utility service (`JwtTokenProvider` for HMAC-SHA256 generation, validation, and claims)
- [x] Implement `CustomUserDetailsService` loading user by email
- [x] Implement `JwtAuthenticationFilter`
- [x] Configure Spring Security `SecurityFilterChain` with stateless session management
- [x] Implement `AuthController` (`POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`)
- [x] Seed default admin (`admin@sneakx.com`) and standard customer (`customer@sneakx.com`)
- [x] Verify auth endpoints with live tests (login success, token validation, user profile)

---

## PHASE 5 — Frontend Foundation
- [x] Implement core design tokens in `design-tokens.css` (colors, fonts, shadows, radii)
- [x] Set up CSS reset and typography in `global.css` (Plus Jakarta Sans, Inter, JetBrains Mono)
- [x] Implement reusable UI components: `Button`, `Badge`, `LoadingSpinner`, `ProtectedRoute`
- [x] Configure Axios instance with base URL and JWT request/response interceptors in `api.js`
- [x] Implement `AuthContext` (token storage, login, register, logout, current user state)
- [x] Implement base application layout with sticky `Navbar` and `Footer`
- [x] Implement React Router structure with Public and Protected Route guards

---

## PHASE 6 — Product Catalogue
- [x] Implement `ProductRepository`, `BrandRepository`, `CategoryRepository`
- [x] Implement `ProductService` with paginated and sorted retrieval
- [x] Implement `ProductController` (`GET /api/products`, `GET /api/brands`, `GET /api/categories`, `GET /api/products/featured`, `GET /api/products/new-releases`)
- [x] Create frontend `ProductCard` component adhering to design system
- [x] Build responsive `CatalogPage` displaying paginated sneaker grid
- [x] Implement skeleton loaders for catalog loading states
- [x] Verify catalog API pagination and sorting

---

## PHASE 7 — Search / Filter / Sort
- [x] Implement dynamic query filtering via JPQL in `ProductRepository` (brand, size, gender, min/max price)
- [x] Implement keyword search endpoint across sneaker name, brand name, and colorway
- [x] Build desktop filter sidebar and mobile filter toggle in frontend
- [x] Add sort dropdown (Price: Low to High, Price: High to Low, Newest)
- [x] Verify multi-filter combination edge cases live

---

## PHASE 8 — Product Details
- [x] Implement single product retrieval endpoint (`GET /api/products/{id}`) with variants, images, and reviews
- [x] Build `ProductDetailPage` view
- [x] Implement interactive multi-angle image gallery with thumbnail preview
- [x] Implement variant selector (`SizeSelector` with stock indicators and dynamic pricing)
- [x] Display product metadata (silhouette story, colorway, brand, gender)
- [x] Add "Add to Bag" and "Wishlist" action buttons with live feedback

---

## PHASE 9 — Cart
- [x] Implement `Cart` & `CartItem` repository and service logic
- [x] Implement atomic cart operations (`GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/{id}`, `DELETE /api/cart/items/{id}`, `DELETE /api/cart`)
- [x] Implement `CartContext` on frontend for real-time cart state synchronization
- [x] Build slide-out `CartDrawer` and dedicated `CartPage`
- [x] Implement item quantity increment/decrement with real-time stock cap validation
- [x] Display order subtotal, estimated shipping (free over ₹5,000), and total calculations

---

## PHASE 10 — Wishlist
- [x] Implement `Wishlist` & `WishlistItem` repositories and service
- [x] Implement wishlist endpoints (`GET /api/wishlist`, `POST /api/wishlist/toggle/{productId}`, `GET /api/wishlist/check/{productId}`)
- [x] Implement `WishlistContext` on frontend
- [x] Add interactive wishlist heart toggle on `ProductCard` and `ProductDetailPage`
- [x] Build dedicated `WishlistPage`

---

## PHASE 11 — Checkout & Orders
- [x] Implement `Address` entity and address management in checkout
- [x] Implement atomic checkout transaction in `OrderService` (stock deduction + order snapshot + cart clearance)
- [x] Implement stock deduction to prevent overselling
- [x] Implement Order endpoints (`POST /api/orders/checkout`, `GET /api/orders`, `GET /api/orders/{id}`)
- [x] Build multi-step `CheckoutPage` (Shipping Address -> Simulated Payment -> Order Review)
- [x] Build `OrderConfirmationPage` with generated Order ID and tracking summary
- [x] Build user `OrdersPage` with status badges and detail view

---

## PHASE 12 — Reviews & Ratings
- [x] Implement `ReviewRepository` and `ReviewService`
- [x] Enforce business rule: only users who completed an order have `isVerifiedPurchase = true`
- [x] Implement Review endpoints (`GET /api/products/{id}/reviews`, `POST /api/products/{id}/reviews`)
- [x] Build review summary breakdown on `ProductDetailPage` (star rating, customer reviews list)
- [x] Build interactive review submission modal (`ReviewModal`) with star rating picker

---

## PHASE 13 — Admin Dashboard
- [x] Implement Admin analytics service aggregating total sales, active orders, customer count, and low stock items
- [x] Implement Admin controller (`GET /api/admin/dashboard`)
- [x] Build `AdminDashboardPage` with KPI summary cards and low stock inventory alerts
- [x] Implement route-level guard (`ROLE_ADMIN` check on frontend and backend `@PreAuthorize("hasRole('ADMIN')")`)

---

## PHASE 14 — Inventory Management
- [x] Implement Admin Product CRUD endpoints (`POST /api/admin/products`, `PUT /api/admin/products/{id}`, `DELETE /api/admin/products/{id}`)
- [x] Implement Admin Variant & Stock update endpoints (`PUT /api/admin/variants/{id}/stock`)
- [x] Build `AdminProductsPage` with search, table view, and Add Sneaker Model modal
- [x] Build Low-Stock alert table on `AdminDashboardPage` with quick-restock triggers
- [x] Build `AdminOrdersPage` with status transitions (`CONFIRMED` -> `SHIPPED` -> `DELIVERED` -> `CANCELLED`) and automatic restock on cancellation
- [x] Build `AdminUsersPage` displaying all registered accounts and assigned roles

---

## PHASE 15 — Recommendation System
- [x] Design explainable rule-based content similarity algorithm (Category: +3, Brand: +2, Price Bracket: +1, Gender: +1)
- [x] Implement recommendation endpoint (`GET /api/recommendations/products/{productId}`)
- [x] Implement user personalized recommendations based on wishlist/order history (`GET /api/recommendations/user`)
- [x] Add "You Might Also Like" recommendations carousel on `ProductDetailPage`

---

## PHASE 16 — Size Recommendation
- [x] Define brand sizing offset dataset (Nike TTS, Yeezy +0.5, Converse -0.5, Adidas TTS, Jordan TTS)
- [x] Implement size advisory endpoint (`POST /api/recommendations/size-advisor`)
- [x] Build interactive "Find Your Size (AI Sizing Advisor)" modal (`SizeAdvisorModal`) on `ProductDetailPage`
- [x] Calculate recommended size based on user's baseline sneaker brand & size with direct application to size selector

---

## PHASE 17 — Testing
- [x] Configure JUnit 5, Mockito, and Spring Boot Test harness
- [x] Author unit tests for `SizeAdvisorServiceTest` verifying brand variance calculations
- [x] Author Spring Boot context test `SneakXApplicationTests`
- [x] Execute automated test suite (`mvn test`: 4/4 tests passed)
- [x] Verify frontend build (`npm run build`: 0 errors)
- [x] Verify live end-to-end journey (Registration -> Catalog -> Cart -> Atomic Checkout -> Verified Review)

---

## PHASE 18 — Security & Performance
- [x] Audit all endpoints for `@PreAuthorize` and role checks
- [x] Verify BCrypt password hashing (strength 12)
- [x] Verify stateless JWT with expiration
- [x] Verify CORS configuration allowing frontend origin

---

## PHASE 19 — Deployment & Production Prep
- [x] Package backend into production-ready fat JAR (`mvn clean package`)
- [x] Build frontend into optimized production bundle (`dist/`)
- [x] Document environment variables and startup procedures in `setup.md`

---

## PHASE 20 — Documentation & Interview Preparation
- [x] Synchronize persistent memory files in `/project-docs/`
- [x] Update `continuation.md` with complete handoff state
- [x] Update `interview-notes.md` with real implementation defense

---

## PHASE 21 — Final Completion Pass & Polish
- [x] Fix Catalogue filtering root causes (JPQL subquery for size, explicit countQuery, strict brand isolation)
- [x] Fix Admin product management filters (Brand dropdown, Category dropdown, Search, Clear filters)
- [x] Expand sneaker inventory in `DataInitializer` to 37 unique silhouettes across 7 brands (Nike, Jordan, Adidas, Yeezy, New Balance, Converse, Puma) and 4 categories
- [x] Overhaul checkout payment flow: prevent premature auto-order placement on selection; add Card, UPI, and COD interactive sections with validation
- [x] Implement demo gateway simulation with safe transaction references (`DEMO_TXN_...`) and failure simulation toggle
- [x] Implement backend `EmailService` using `spring-boot-starter-mail` with HTML confirmation receipt and graceful dev fallback logging
- [x] Upgrade `OrderConfirmationPage` with "Order Confirmed ✓" badge, order ID, items list, and navigation buttons
- [x] Add tasteful modern animations in `global.css` (card lift, image zoom/tilt, wishlist heart pop, grid entrance, hero ambient pulse) with `prefers-reduced-motion` compliance
- [x] Verify backend build (`mvn clean compile test package` -> BUILD SUCCESS)
- [x] Verify frontend build (`npm run build` -> 0 errors)
- [x] Verify live flows via automated scripts (Brand isolation, Category filters, Sizing, Sorting, Card checkout, COD checkout, Admin filters)

---

## PHASE 22 — Luxury Frontend Visual Experience Transformation
- [x] Introduce luxury design tokens: glassmorphism, `--ease-spring`, brand gradients, and ambient glow pulses
- [x] Upgrade Navbar with scroll-aware glass blur, active tab indicator with ambient glow, and animated search input
- [x] Redesign HomePage Hero into a 2-column editorial sneaker stage with 3D floating sneaker, contact shadow, price tags, and interactive grail switcher
- [x] Upgrade reusable `ProductCard` with radial spotlight vignette, size preview hover drawer, image tilt/zoom, brand tags, and vector SVG fallback
- [x] Create editorial category cards for Basketball, Lifestyle, Running, and Skateboarding with rich photographic backdrops
- [x] Create interactive brand showcase for Nike, Jordan, Adidas, Yeezy, New Balance, Converse, and Puma
- [x] Upgrade trust & engineering deck to modern glass panels with glowing badges
- [x] Upgrade Footer with VIP Drop Calendar newsletter alerts input and payment security trust badges
- [x] Enforce `@media (prefers-reduced-motion: reduce)` accessibility compliance across all animations
- [x] Verify production build (`npm run build` -> built in 2.68s, 0 errors) and live responsive layout


