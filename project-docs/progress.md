# SneakX — Chronological Development Progress Log

---

### Entry 1
- **Date**: 2026-09-06
- **Phase**: PHASE 0 — Planning & Project Setup
- **Task**: Project initialization, memory system establishment, and architecture planning
- **What changed**:
  - Inspected repository and verified clean initial state.
  - Initialized `/project-docs/` persistent AI memory directory with 13 core markdown documents.
  - Configured root `.gitignore`.
- **Testing**: Verified directory structure and file readability.
- **Result**: Documentation baseline established.

---

### Entry 2
- **Date**: 2026-09-06
- **Phase**: PHASES 1 through 16 (Full-Stack Continuous Build)
- **Task**: Complete Full-Stack Implementation of SneakX (Backend, Database, Frontend, Auth, Catalog, Cart, Checkout, Admin, Sizing & Recommendations)
- **What changed**:
  - **Backend**:
    - Created Maven `pom.xml` with Spring Boot 3.3.4, Spring Web, Data JPA, Security, Validation, MySQL & H2, JJWT.
    - Implemented 15 normalized JPA entities with `@MappedSuperclass` auditing (`User`, `Role`, `Address`, `Brand`, `Category`, `Product`, `ProductVariant`, `ProductImage`, `Cart`, `CartItem`, `Wishlist`, `WishlistItem`, `Order`, `OrderItem`, `Review`).
    - Implemented 15 Spring Data JPA Repositories with custom JPQL queries and pagination.
    - Implemented Stateless JWT Authentication (`JwtTokenProvider`, `JwtAuthenticationFilter`, `CustomUserDetailsService`).
    - Implemented centralized exception handling (`GlobalExceptionHandler`) and standardized `ApiResponse<T>`.
    - Implemented comprehensive service layer: `AuthService`, `ProductService`, `CartService`, `WishlistService`, `OrderService` (atomic checkout with stock deduction), `ReviewService`, `RecommendationService` (explainable scoring), `SizeAdvisorService` (brand variance heuristics), and `AdminService`.
    - Implemented 9 REST Controllers covering 30+ endpoints.
    - Implemented `DataInitializer` pre-loading roles, admin, demo customer, brands, categories, 8 flagship sneakers with multi-size variants, and reviews.
  - **Frontend**:
    - Initialized React 18+ with Vite, React Router v6, and Lucide React.
    - Implemented complete design system in `design-tokens.css` and `global.css`.
    - Built Axios API service layer (`authService`, `productService`, `cartService`, `wishlistService`, `orderService`, `reviewService`, `recommendationService`, `adminService`).
    - Built global state contexts: `AuthContext`, `CartContext`, `WishlistContext`.
    - Built reusable UI components: `Navbar`, `Footer`, `ProductCard`, `ProductGrid`, `SizeSelector`, `CartDrawer`, `SizeAdvisorModal`, `ReviewModal`, `ProtectedRoute`, `LoadingSpinner`.
    - Built all pages: `HomePage`, `CatalogPage` (multi-faceted filters & search), `ProductDetailPage` (gallery & reviews), `CartPage`, `CheckoutPage` (address & simulated payment), `OrderConfirmationPage`, `OrdersPage`, `WishlistPage`, `LoginPage` (with quick-fill demo pills), `RegisterPage`, and full Admin portal (`AdminDashboardPage`, `AdminProductsPage`, `AdminOrdersPage`, `AdminUsersPage`).
- **Testing**:
  - `mvn clean compile`: 92 source files compiled cleanly (BUILD SUCCESS).
  - `mvn package`: Executable fat JAR built in 6.6s.
  - `mvn test`: 4/4 automated tests passed (Spring Boot context + unit tests).
  - `npm run build`: Vite production bundle created in 11.82s (0 errors).
  - Runtime verification: Live REST testing verified Health (UP), Catalog (8 products), Admin Login (JWT generated), Sizing Advisor (Yeezy +0.5 calculated), Customer Registration, Cart Addition, Atomic Checkout, and Verified Review posting.
- **Result**: Complete, working, production-style e-commerce platform operational.

---

### Entry 3
- **Date**: 2026-09-06
- **Phase**: FINAL COMPLETION PASS — Bug Fix, Inventory Expansion, Payment Overhaul & UI Polish
- **Task**: Root-cause catalogue and admin filtering fixes, 37 sneaker inventory expansion across 7 brands, multi-step interactive payment gateway simulation, Spring Mail order confirmation receipt with safe dev fallback, and modern UI animations.
- **What changed**:
  - **Catalogue & Admin Filtering Root-Cause Fix**:
    - Re-architected `ProductRepository.findFiltered` JPQL: eliminated outer collection joins on variants that caused pagination row multiplication and HHH memory warnings; introduced strict subquery `p.id IN (SELECT pv.product.id FROM ProductVariant pv WHERE pv.size = :size)` and explicit `countQuery`.
    - Added strict brand isolation: selecting a brand returns *only* sneakers for that specific brand (e.g. Nike returns only Nike, Jordan returns only Jordan).
    - Normalized category routing: resolved navbar parameter mismatch (`categoryId` vs `category`).
    - Added `name_asc` and `name_desc` sorting to backend `ProductService` and frontend dropdowns.
    - Added active filter chips bar in `CatalogPage` with individual dismiss buttons and a dedicated "Reset All" action.
    - Updated `AdminProductsPage` with Brand, Category, Search filters and Reset button.
  - **Inventory Expansion (37 Unique Sneaker Silhouettes)**:
    - Expanded seeded inventory in `DataInitializer` from 8 to 37 unique, authentic sneaker silhouettes across 7 brands (Nike, Jordan, Adidas, Yeezy, New Balance, Converse, Puma) and 4 categories (Basketball, Lifestyle, Running, Skateboarding) with realistic pricing (₹4,999 to ₹89,999), 6–8 sizes per model, and authentic stock levels.
  - **Payment Flow & Order Creation Timing**:
    - Completely decoupled payment method selection from order placement in `CheckoutPage`.
    - Created dedicated interactive payment views for Card (masked card formatting, MM/YY expiry, CVV, validation), Instant UPI (VPA input, demo handle pills, instant verification), and Cash on Delivery (COD).
    - Added simulated payment processing with loading feedback, safe transaction reference generation (`DEMO_TXN_...`), and demo failure simulation for edge-case testing.
    - Zero sensitive payment credentials stored in database; only `paymentMethod`, `paymentStatus`, and `paymentReference` persisted.
    - Guaranteed that orders are created *only* after payment success (or COD confirmation), with double-submission locks.
  - **Order Confirmation Email Service**:
    - Added `spring-boot-starter-mail` and implemented `EmailService` generating rich HTML confirmation receipts.
    - Configurable with `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM`.
    - Implemented safe development fallback: logs a formatted ASCII receipt to console if SMTP is not configured, ensuring zero application crashes.
  - **Order Confirmation Page**:
    - Enhanced `OrderConfirmationPage` with "Order Confirmed ✓" badge, order tracking ID, payment status, purchased item thumbnails and sizing, delivery destination, and navigation action buttons.
  - **Modern UI Polish & Animations**:
    - Added smooth card hover lift (`translateY(-6px)`), image zoom/tilt, wishlist heart pop animation, and staggered card entrance animations in `global.css` and `ProductCard.jsx`.
    - Enhanced `HomePage` hero section with animated ambient radial glow (`@keyframes heroGlowPulse`), floating badges, and glowing CTA buttons.
    - Enforced full accessibility compliance with `@media (prefers-reduced-motion: reduce)`.
- **Testing & Verification**:
  - `mvn clean compile test package`: All 4 tests passed, fat JAR packaged (BUILD SUCCESS).
  - `npm run build`: Production bundle built cleanly in 2.71s with zero errors.
  - Live API testing verified:
    - Brand isolation across all 7 brands (Nike: 8, Jordan: 7, Adidas: 6, Yeezy: 5, New Balance: 5, Converse: 3, Puma: 3).
    - Category filtering across Basketball (9), Lifestyle (20), Running (6), Skateboarding (2).
    - Sizing filter (size 10.0 -> 7 Nike models).
    - Sorting (`name_asc` starts with "Adidas Campus 00s", `name_desc` starts with "Yeezy Slide Onyx").
    - End-to-end checkout with `SIMULATED_CARD` and `COD` generating orders and triggering console email receipts.
    - Admin product filtering by brand, category, and search.
- **Result**: Fully polished, verified, production-grade sneaker e-commerce platform ready for interviews and demonstrations.

---

### Entry 4
- **Date**: 2026-09-06
- **Phase**: FRONTEND VISUAL EXPERIENCE TRANSFORMATION (Luxury Editorial Sneaker Marketplace)
- **Task**: Significant frontend visual elevation transforming SneakX into a premium, modern sneaker-commerce experience (inspired by Nike Lab, Kith, GOAT).
- **What changed**:
  - **Design Tokens & Motion System (`design-tokens.css` & `global.css`)**:
    - Added glassmorphism tokens (`--glass-bg`, `--glass-border`, `--glass-blur: blur(18px)`).
    - Added luxury easing curve: `--ease-spring: cubic-bezier(0.16, 1, 0.3, 1)` and `--duration-fast/normal/slow`.
    - Added keyframes: `@keyframes floatSneaker` (3D vertical drift & tilt), `@keyframes floatShadow` (breathing contact shadow), `@keyframes heroContentEntrance`, `@keyframes heroSneakerEntrance`, `@keyframes pulseDot`.
    - Added text gradients: `.text-gradient-brand` and `.text-gradient-gold`.
    - Maintained full `@media (prefers-reduced-motion: reduce)` accessibility overrides.
  - **Navbar Refinement (`Navbar.jsx`)**:
    - Added scroll-aware blur header with dynamic elevation on window scroll (`scrolled` state).
    - Added active tab indicator (crimson underline with ambient glow when matching route).
    - Added animated search input with red focus glow and instant clear button.
    - Improved wishlist and cart circular pill buttons with hover lifts and count badges.
  - **Cinematic Hero Overhaul (`HomePage.jsx`)**:
    - Redesigned into a 2-column editorial sneaker stage.
    - Left side: Live drop announcement pill with pulsating volt beacon, bold typography ("CULTURE IN EVERY STEP. GRAILS IN EVERY DROP."), curated subtitle, primary/secondary glowing CTAs, and live micro-metrics bar (100% Deadstock Verified, 0 ms Oversell Tolerance, 7 Official Brands).
    - Right side: Floating 3D sneaker focal point with dynamic contact shadow, top-right floating price pill ("GRAIL OF THE MONTH • JORDAN • ₹16,999"), bottom-left green deadstock certification seal, and interactive one-click grail switcher pills (Jordan, Nike, AJ4) that auto-cycle smoothly.
  - **Reusable ProductCard Upgrade (`ProductCard.jsx`)**:
    - Embedded radial vignette spotlight backdrop behind each sneaker.
    - Enhanced hover lift (`translateY(-8px)`) and image tilt (`scale(1.10) rotate(-3deg)`).
    - Added quick size preview drawer on hover ("Sizes: UK 7 · 8 · 9 · 10 · 11 →").
    - Embedded high-resolution vector SVG fallback if remote image ever fails to load.
    - Added brand badges and gender indicators.
  - **Editorial Category Tiles (`HomePage.jsx`)**:
    - Replaced flat links with rich photography background cards (Basketball, Lifestyle, Running, Skateboarding) with gradient vignette overlays and zoom on hover.
  - **Interactive Brand Showcase (`HomePage.jsx`)**:
    - Displayed all official brands (Nike, Jordan, Adidas, Yeezy, New Balance, Converse, Puma) as interactive dark minimal cards with display typography, model count tags, and red accent bars.
  - **Engineered Trust & Value Pillars (`HomePage.jsx`)**:
    - Modern 4-column glass deck (Atomic Checkout Reservation, Brand Sizing Advisor, 100% Deadstock Guarantee, Double-Boxed Express).
  - **Architectural Footer Upgrade (`Footer.jsx`)**:
    - Added VIP Drop Calendar newsletter subscription banner with instant feedback state ("Subscribed to SneakX VIP Drop Alerts!").
    - Added 4-column navigation (Silhouettes, Verification, Architecture, Monogram).
    - Added security and payment trust badges (256-Bit SSL, PCI-DSS Safe Demo, UPI/Card/COD Accepted).
- **Testing & Verification**:
  - `npm run build`: Production bundle built cleanly in 2.68s with zero errors.
  - Vite HMR verified across all modified components.
  - Responsive layout verified across mobile, tablet, and desktop breakpoints.
- **Result**: Visual transformation complete; SneakX now has the polish and aesthetic of a commercial luxury sneaker marketplace.

---

### Entry 5
- **Date**: 2026-09-06
- **Phase**: FINAL CRITICAL BUG FIX & COMPLETE PROJECT AUDIT
- **Task**: Root-cause fix for brand section isolation bug across backend and frontend, full 37-sneaker seed image audit & remediation, automated integration tests, and complete lifecycle audit.
- **What changed**:
  - **Backend Parameter Resolution (`ProductController.java` & `ProductService.java`)**:
    - Added `@RequestParam String brand` and `String category` parameters.
    - Implemented automatic case-insensitive resolution of brand and category slugs/names to primary database entity IDs via `brandRepository` and `categoryRepository`.
    - If an invalid or unknown brand/category string is passed, it resolves to `-1L`, returning 0 products (completely preventing fallback leakage to all catalogue products).
  - **Database Image Integrity & Remediation (`DataInitializer.java`)**:
    - Audited all 37 seeded sneakers across all 7 brands.
    - Discovered and eliminated 11 cross-brand image collisions where shoes displayed images of rival brands (e.g. Nike Panda Dunk used on Adidas Campus; Nike Air Force 1 used on Yeezy Slide and Puma Palermo; Nike SB Dunk used on Yeezy Wave Runner, Adidas Gazelle, Puma Suede; Jordan 1 used on NB 2002R).
    - Verified 20+ distinct Unsplash photos with HTTP 200 checks and mapped every sneaker to authentic, distinct, brand-specific imagery.
  - **Frontend State Synchronization (`CatalogPage.jsx` & `ProductDetailPage.jsx`)**:
    - Synchronized `brand`/`brandId` and `category`/`categoryId` in `CatalogPage`.
    - Added immediate clearing of stale product state on filter transition (`setProducts([])`) with cancellation token (`isMounted`) to prevent race conditions.
    - Enhanced filter removal and "Reset All" to clean up both ID and string URL query parameters.
    - Added neutral vector silhouette SVG fallback handler (`onError`) on product detail hero images and thumbnails.
  - **Automated Integration Tests (`ProductIsolationAndOrderTest.java`)**:
    - Added automated test suite verifying 100% brand isolation for Nike, Jordan, Adidas, Brand + Category, Brand + Search, Brand + Sort. All 10 backend tests passing.
- **Testing & Verification**:
  - Backend build & test: `mvn clean compile test package` -> 10/10 tests passed (BUILD SUCCESS).
  - Frontend build: `npm run build` -> Vite production bundle created in 5.79s with 0 errors.
  - Live API testing (`verify_api.ps1`):
    - Nike: 8/8 (100% Nike)
    - Jordan: 7/7 (100% Jordan)
    - Adidas: 6/6 (100% Adidas)
    - Yeezy: 5/5 (100% Yeezy)
    - New Balance: 5/5 (100% New Balance)
    - Converse: 3/3 (100% Converse)
    - Puma: 3/3 (100% Puma)
    - Total: 37 unique, authentic silhouettes.
    - Brand + Category, Brand + Search, Brand + Sort: 0 mismatches across all tests.
  - End-to-End customer lifecycle (`verify_e2e.ps1`): Auth, product details, cart, atomic checkout, simulated card payment, order confirmation, and admin access verified.
- **Result**: Brand isolation bug eliminated at root cause; all acceptance criteria met.

---

### Entry 6
- **Date**: 2026-09-24
- **Phase**: SECURITY HARDENING, CREDENTIAL SANITIZATION & REPOSITORY CLEANUP
- **Task**: Eliminate hardcoded production credentials, remove PII, sanitize fallback secrets, and update database passwords.
- **What changed**:
  - **README & Documentation Sanitization**:
    - Removed exposed evaluation credential tables and replaced with secure contact notes.
    - Updated documentation to emphasize Aiven Cloud MySQL and H2 in-memory options without exposing hostnames or credentials.
  - **DataInitializer & Configuration Hardening**:
    - Replaced hardcoded admin and customer credentials with environment variables (`ADMIN_INITIAL_PASSWORD`, `DEMO_CUSTOMER_PASSWORD`) with safe local placeholders.
    - Replaced real personal phone numbers with placeholder contact format (`+91 98765 43210`) and removed all PII from application logs.
    - Removed hardcoded fallback production JWT signing keys from `application.yml` and `JwtTokenProvider.java`.
  - **Database Credentials Update**:
    - Updated admin and customer credentials directly in Aiven MySQL database with secure BCrypt hashes (strength 12).
- **Testing & Verification**:
  - `mvn test`: 31/31 backend tests passed.
  - Live login verification against Aiven MySQL database.
- **Result**: Complete elimination of committed secrets and PII from codebase.

---

### Entry 7
- **Date**: 2026-09-27
- **Phase**: SAVED ADDRESSES & CHECKOUT EXPERIENCE ELEVATION
- **Task**: Implement full saved addresses support for authenticated users at checkout with address card selection, auto-default selection, add-new modal/form, and order integration.
- **What changed**:
  - **Backend Address Subsystem**:
    - Enhanced `Address.java` entity with convenient getter/setter aliases (`phoneNumber`, `pinCode`).
    - Enhanced `AddressRepository.java` with user-scoped lookup `findByIdAndUserId(Long id, Long userId)` and default-ordered queries (`findByUserIdOrderByIsDefaultDescIdDesc`).
    - Created `AddressService.java` providing complete user-scoped address management (`getUserAddresses`, `createAddress`, `updateAddress`, `deleteAddress`, `setDefaultAddress`).
    - Created `AddressController.java` with protected endpoints (`GET`, `POST`, `PUT /{id}`, `DELETE /{id}`, `PATCH /{id}/default` under `/api/addresses`), strictly verified via `@AuthenticationPrincipal UserPrincipal`.
    - Updated DTOs (`AddressDto`, `CreateAddressRequest`, `CheckoutRequest`, `PaymentVerificationRequest`) with `saveAddress` flag support.
    - Updated `OrderService.java` and `PaymentService.java` to support checking out using either `addressId` or new address object with optional persistence (`saveAddress: true`).
    - Added dedicated automated test suite in `AddressControllerTest.java`.
  - **Frontend Checkout Integration**:
    - Created `addressService.js` client service with JWT handling.
    - Updated `CheckoutPage.jsx` to fetch saved addresses for authenticated users upon mount.
    - Implemented selectable address cards matching `.payment-card-option` styling with `.is-active-razorpay` active border (`#FF3B30`), radio indicator, and "DEFAULT" badge.
    - Automatically pre-selects the default address for one-click checkout progression.
    - Added `+ Add New Address` card styled with dashed border, opening the inline address form with a cancel option.
    - Preserved blank form for guest / first-time users.
- **Testing & Verification**:
  - `mvn test`: All 34/34 backend tests passed cleanly (BUILD SUCCESS).
  - `npm run build`: Vite production bundle created with zero errors (built in 14.0s).
- **Result**: Seamless Amazon/Myntra-style saved address checkout workflow live and verified.

---

### Entry 8
- **Date**: 2026-09-27
- **Phase**: CHECKOUT ORDER SUMMARY PRICE BREAKDOWN & GST DISPLAY
- **Task**: Align Checkout page order summary price breakdown with the order confirmation receipt format.
- **What changed**:
  - **Order Summary Price Breakdown (`CheckoutPage.jsx`)**:
    - Added a `Tax:` row showing `Included in price (18% GST)` between `Subtotal` and `Shipping` in the Checkout summary card.
    - Reused the exact wording and format from the confirmation receipt (`EmailService.java`).
    - Styled with existing dark theme tokens (`var(--text-secondary)`, `var(--text-muted)`) and consistent flex gap spacing (`8px`).
    - Preserved calculation and billing integrity: final total and charged amount remain unchanged since 18% GST is already included in item pricing.
- **Testing & Verification**:
  - `npm run build`: Vite production bundle compiled cleanly in 9.73s with zero errors.
---

### Entry 9
- **Date**: 2026-09-28
- **Phase**: COUPON & DISCOUNT CODES ENGINE (Customer Checkout & Admin Management)
- **Task**: Implement a production-grade coupon code system across frontend and backend with server-side validation, flexible discount rules (percentage with max cap, flat discount, min order value, expiry date, usage limit, one-use-per-user), Razorpay and COD payment synchronization, order history breakdown, email receipt updates, and admin CRUD controls.
- **What changed**:
  - **Backend Core**:
    - Created `Coupon.java` JPA entity with fields for code, discount type (`PERCENTAGE`, `FLAT`), discount value, max discount cap, min order amount, expiry date, total usage limit, usage count, one-per-user restriction, and active status flag.
    - Updated `Order.java` entity to record `couponCode`, `discountAmount`, and `subtotal`.
    - Created `CouponRepository.java` and updated `OrderRepository.java` (`existsByUserIdAndCouponCodeIgnoreCaseAndStatusNot`).
    - Implemented `CouponService.java` with strict multi-layer server-side validation engine (active check, expiration, total usage limit, cart subtotal determination, min order threshold, one-per-user check, capped percentage or flat calculation) and Admin CRUD methods.
    - Updated `OrderService.java` to enforce coupon validation at atomic checkout, deduct calculated discount from subtotal, record coupon details on order, and increment coupon usage count.
    - Updated `PaymentService.java` to compute discounted order total on server before creating Razorpay order and verifying signatures.
    - Updated `EmailService.java` to render discount line item in HTML order confirmation receipts and ASCII log fallback.
    - Seeded initial coupons in `DataInitializer.java`: `SNEAK10` (10% off up to ₹2500, min order ₹3000), `FLAT500` (flat ₹500 off, min order ₹4000), `GRAIL20` (20% off up to ₹5000, min order ₹10000).
    - Created `CouponController.java` (`POST /api/coupons/validate`) and `AdminCouponController.java` (`GET`, `POST`, `PUT /{id}`, `PATCH /{id}/toggle`, `DELETE /{id}` under `/api/admin/coupons`).
    - Authored unit/integration tests in `CouponServiceTest.java` (10 test cases covering percentage calculation, discount cap, flat discount, invalid code, inactive code, expired coupon, subtotal below minimum, usage limit reached, one-per-user enforcement, and admin CRUD).
  - **Frontend UI & Integration**:
    - Created `couponService.js` client service for customer validation and admin operations.
    - Enhanced `CheckoutPage.jsx` Order Summary with "Apply coupon" input, Apply button, inline error/success messages, dynamic "Discount" row between Subtotal and Tax/Shipping, updated Final Total, and "Remove" coupon action.
    - Passed validated `couponCode` through both Razorpay and COD checkout flows.
    - Updated `paymentService.js` to pass `couponCode` when creating payment orders.
    - Updated `OrderConfirmationPage.jsx` to display Subtotal, applied Coupon Discount, and net total.
    - Updated `OrdersPage.jsx` to render green coupon badge `[COUPON] (-₹X)` on customer order cards.
    - Upgraded `AdminDashboardPage.jsx` with a dedicated Coupon Management tab featuring live statistics, coupon creation form, status toggles, deletion, and usage tracking table.
- **Testing & Verification**:
  - `mvn test`: 44/44 backend tests passed cleanly (BUILD SUCCESS).
  - `npm run build`: Vite production bundle compiled cleanly in 14.00s with zero errors.
- **Result**: Production-grade coupon and discount engine live, verified, and integrated end-to-end.



