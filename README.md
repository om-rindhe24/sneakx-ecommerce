# SneakX — Premium Sneaker E-Commerce Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-77%2F77%20Passed-brightgreen?style=for-the-badge&logo=checkmarx&logoColor=white)](#testing--verification)

> **SneakX** is an enterprise-grade, full-stack e-commerce marketplace tailored for the global sneakerhead culture. Designed with a streetwear aesthetic, it combines brand-isolated catalog browsing, heuristic-driven size advisory algorithms, atomic order processing with Razorpay, and transactional email fulfillment via Brevo and SMTP.

---

## 🌐 Live Deployments

| Component | Platform | Live URL | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Web Application** | Render | [https://sneakx-frontend.onrender.com](https://sneakx-frontend.onrender.com) | ![Active](https://img.shields.io/badge/Status-Online-success?style=flat-square) |
| **Backend REST API** | Render | [https://sneakx-backend-sm4h.onrender.com](https://sneakx-backend-sm4h.onrender.com) | ![Active](https://img.shields.io/badge/Status-Online-success?style=flat-square) |
| **API Health Check** | Render | [https://sneakx-backend-sm4h.onrender.com/api/health](https://sneakx-backend-sm4h.onrender.com/api/health) | `{"status":"UP"}` |

> 🔒 **Security Notice & Demo Access**: Pre-configured demo credentials for the admin dashboard and customer accounts are available upon request for recruiters and hiring managers. Please contact [rindheom261@gmail.com](mailto:rindheom261@gmail.com) for secure access.

---

## 📸 Application Preview

> *Streetwear-inspired dark mode interface with neon accents, fluid transitions, and responsive mobile-first layouts.*

```text
┌────────────────────────────────────────────────────────────────────────┐
│  SNEAKX STREETWEAR MARKETPLACE                                         │
│  7 Curated Brand Silos  •  37 Silhouettes  •  Size Advisor Heuristics  │
└────────────────────────────────────────────────────────────────────────┘
```

| Interface View | Experience Highlights | Target Device |
| :--- | :--- | :--- |
| **Catalog & Brand Silos** | Strict brand isolation, instant search & compound filters | Desktop / Tablet |
| **Product Detail & Fit** | Interactive size selector, stock alerts & Size Advisor | Mobile / Touch |
| **Admin Operations** | Executive revenue KPIs, order state machine & stock triage | Authenticated Admin |

*(Screenshots can be added under `assets/screenshots/`)*

---

## ⚡ Key Features

### 1. Isolated Multi-Brand Silos & Catalog Scoping
- **Strict Brand Isolation**: 7 top-tier sneaker brands (*Nike, Jordan, Adidas, Yeezy, New Balance, Converse, Puma*) with zero foreign leaks across queries, sorting, and pagination.
- **Dynamic Compound Filtering**: Combine Brand, Category (*Basketball, Lifestyle, Running, Skateboarding*), Gender, Price Range, and Keyword Search concurrently.
- **Pre-seeded Sneaker Catalog**: 37 authentic silhouettes seeded with accurate retail pricing, colorways, high-resolution galleries, and complete size runs (UK 7.0 – UK 12.0).

### 2. Intelligent Size Advisor (Cross-Brand Heuristic Engine)
- Solves sneakerhead sizing variances (e.g., *Yeezy Boost 350 V2* running +0.5 size small compared to standard Nike sizing).
- Users select their reference sneaker brand and baseline size; the system computes the recommended size with plain-English fit guidance.

### 3. Content-Based Sneaker Recommendations
- Multi-factor affinity scoring algorithm evaluating Category (+3), Brand (+2), Price proximity within 25% (+1), and Gender match (+1).
- Delivers personalized suggestions on detail pages and customer dashboards.

### 4. Robust Cart & Wishlist Lifecycle
- **Real-time Price & Stock Verification**: Prevents overbooking by checking variant inventory on every cart modification.
- **Server-side Persistence**: Carts and wishlists are bound to customer IDs with instant synchronization across devices.

### 5. Multi-Channel Checkout & Payments
- **Razorpay Payment Gateway**: Integration with client-side checkout and backend cryptographic **HMAC-SHA256 signature verification**.
- **Alternative Payment Modes**: Simulated Credit/Debit Card, UPI, and Cash on Delivery (COD).
- **Atomic Transactional Guarantees**: Inventory decrements, cart flushing, and order persistence execute inside a single transactional boundary (`@Transactional`).

### 6. Automated Transactional Emails
- **Brevo REST API v3 Integration**: Sends responsive HTML order confirmation receipts and VIP newsletter welcome emails asynchronously.
- **SMTP Fallback Engine**: Seamlessly falls back to JavaMailSender SMTP (Gmail, SendGrid) or development console logging if external API tokens are omitted.

### 7. Verified Customer Reviews
- **Verified Purchase Enforcement**: Product reviews automatically verify whether the reviewer placed a confirmed order for that specific silhouette.
- **Dynamic Aggregate Calculations**: Rating averages and count tallies update immediately upon submission.

### 8. Admin Control Center
- **Executive KPI Dashboard**: Live tracking of Gross Revenue, Completed Orders, Registered Users, and Low-Stock Warnings (< 3 units).
- **Order Lifecycle Management**: Administrative state machine transitioning orders (`PLACED` &rarr; `CONFIRMED` &rarr; `SHIPPED` &rarr; `DELIVERED` &rarr; `CANCELLED`), with automatic restock on cancellations.

---

## 🛠️ Technology Stack

```mermaid
graph TD
    subgraph Client["Client Tier (React 18 + Vite 5)"]
        UI[React SPA] --> Axios[Axios Interceptors & JWT]
    end

    subgraph Server["Application Tier (Spring Boot 3.3.3)"]
        Gateway[Spring Security 6 & JWT Filter]
        Controllers[REST Controllers]
        Services[Transactional Business Services]
        Gateway --> Controllers --> Services
    end

    subgraph Data["Data Tier"]
        DB[(Aiven Cloud MySQL / Local H2)]
    end

    subgraph External["External Integrations"]
        Razorpay[Razorpay Payment Gateway]
        Brevo[Brevo REST API / SMTP]
    end

    Axios -->|HTTPS / JSON| Gateway
    Services --> DB
    Services --> Razorpay
    Services --> Brevo
```

### Backend Architecture
- **Language & Runtime**: Java 17 / Java 21+
- **Framework**: Spring Boot 3.3.3
- **Security**: Spring Security 6 with stateless JWT (`jjwt 0.12.6`), BCrypt password hashing, and role-based access control (`ROLE_USER`, `ROLE_ADMIN`).
- **Persistence**: Spring Data JPA, Hibernate ORM, HikariCP connection pooling.
- **Database**: MySQL 8.x (production), H2 in-memory (automated testing profile).
- **Third-Party Integrations**: Razorpay Java SDK, Brevo Transactional Email API v3, Jakarta Mail.

### Frontend Architecture
- **Framework**: React 18 (Functional components, custom hooks, Context API).
- **Build Tool**: Vite 5 with Hot Module Replacement (HMR).
- **Routing**: React Router v6.
- **Icons & Styling**: Lucide React, Custom Dark Mode / Neon Volt Design System with responsive CSS Grid/Flexbox.
- **HTTP Client**: Axios with centralized request/response interceptors for JWT token injection and error interception.

---

## 🏗️ System Architecture & Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Sneakerhead
    participant React as React Frontend (Vite)
    participant Gateway as Security Filter / JWT
    participant Controller as REST Controller
    participant Service as Transactional Service
    participant DB as MySQL Database
    participant Payment as Razorpay API
    participant Mail as Brevo / SMTP API

    Customer->>React: Select Size & Click "Checkout"
    React->>Gateway: POST /api/orders/checkout (Bearer JWT)
    Gateway->>Gateway: Validate Signature & Extract UserPrincipal
    Gateway->>Controller: Forward to OrderController
    Controller->>Service: checkout(userId, CheckoutRequest)
    Service->>DB: Check stock & decrement variant inventory
    Service->>DB: Save Order & OrderItems
    Service->>DB: Clear Customer Cart
    Service-->>Mail: Dispatch Async Confirmation Email (Event)
    Service-->>Controller: Return OrderDto
    Controller-->>React: HTTP 201 Created (Order Details)
    React-->>Customer: Render Order Confirmation & Receipt
```

---

## 📋 API Specification

All API responses follow a consistent envelope structure:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... },
  "errors": null,
  "timestamp": "2026-09-24T14:32:00"
}
```

| HTTP Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System uptime & health status check |
| `POST` | `/api/auth/register` | Public | Register new customer account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return signed JWT token |
| `GET` | `/api/auth/me` | Customer / Admin | Retrieve current authenticated user profile |
| `GET` | `/api/products` | Public | Paginated sneaker catalog with multi-filter query params |
| `GET` | `/api/products/{id}` | Public | Full product details including all size variants & inventory |
| `GET` | `/api/products/slug/{slug}` | Public | Retrieve product details by SEO-friendly URL slug |
| `GET` | `/api/products/featured` | Public | Curated list of featured release sneakers |
| `GET` | `/api/products/new-releases` | Public | Newly added sneaker arrivals |
| `GET` | `/api/brands` | Public | List all 7 brand silos with metadata & vector logos |
| `GET` | `/api/categories` | Public | List all product categories |
| `POST` | `/api/recommendations/size-advisor` | Public | Compute recommended shoe size against reference sneaker |
| `GET` | `/api/recommendations/products/{id}` | Public | Content-based recommendations for similar silhouettes |
| `GET` | `/api/cart` | Customer | Fetch current active shopping cart |
| `POST` | `/api/cart/items` | Customer | Add product variant and quantity to cart |
| `PUT` | `/api/cart/items/{id}` | Customer | Update item quantity in cart |
| `DELETE` | `/api/cart/items/{id}` | Customer | Remove specific item from cart |
| `DELETE` | `/api/cart` | Customer | Empty entire active cart |
| `GET` | `/api/wishlist` | Customer | Retrieve customer's saved sneakers |
| `POST` | `/api/wishlist/toggle/{productId}` | Customer | Add or remove sneaker from customer wishlist |
| `GET` | `/api/wishlist/check/{productId}` | Customer | Check if a specific sneaker is saved in wishlist |
| `POST` | `/api/orders/checkout` | Customer | Atomic checkout for cart items (COD / Direct) |
| `GET` | `/api/orders` | Customer | Retrieve order history for current customer |
| `GET` | `/api/orders/{id}` | Customer / Admin | Detailed order breakdown and shipping info |
| `POST` | `/api/payments/create-order` | Customer | Initialize Razorpay payment order |
| `POST` | `/api/payments/verify` | Customer | Verify HMAC-SHA256 payment signature & confirm order |
| `GET` | `/api/products/{id}/reviews` | Public | List all customer reviews for a silhouette |
| `POST` | `/api/products/{id}/reviews` | Customer | Submit verified purchase rating and review |
| `POST` | `/api/newsletter/subscribe` | Public | Subscribe email to VIP drops with automated welcome dispatch |
| `GET` | `/api/admin/dashboard` | Admin Only | Executive summary statistics (Revenue, Orders, Low Stock) |
| `GET` | `/api/admin/orders` | Admin Only | Paginated triage table of all store orders |
| `PUT` | `/api/admin/orders/{id}/status` | Admin Only | Transition order lifecycle (`CONFIRMED`, `SHIPPED`, etc.) |
| `GET` | `/api/admin/users` | Admin Only | List all registered platform customer accounts |
| `POST` | `/api/admin/products` | Admin Only | Create new sneaker silhouette with variants |
| `PUT` | `/api/admin/products/{id}` | Admin Only | Modify sneaker metadata and pricing |
| `DELETE` | `/api/admin/products/{id}` | Admin Only | Soft-delete / deactivate product from catalog |
| `PUT` | `/api/admin/variants/{id}/stock` | Admin Only | Update live stock counts for a specific size SKU |

---

## 🧪 Testing & Verification

SneakX maintains strict verification standards with multi-layer test coverage:

```
==========================================================
 SneakX Automated Test Execution Summary
==========================================================
 Total Automated Tests Executed:  77
 Total Passing:                   77 (100% Pass Rate)
 Total Failures / Regressions:    0
==========================================================
```

### 1. Backend Integration & Unit Tests (`31 Passing`)
Executed via `mvn test` utilizing JUnit 5, Mockito, and Spring Boot Context:
- **`ProductIsolationAndOrderTest`**: Verifies strict 100% brand isolation across all 7 brands, compound brand/category queries, brand/search, and brand/sort combinations without cross-brand leaks.
- **`PaymentServiceTest`**: Validates cryptographic HMAC-SHA256 signature generation, validation, and malicious tampering rejection.
- **`SizeAdvisorServiceTest`**: Tests half-size-up (+0.5), true-to-size, and half-size-down heuristic rules.
- **`OrderConfirmationEmailTest`**: Tests transactional email generation across COD, Card, and UPI payments.
- **`BrevoEmailTest`**: Verifies Brevo v3 API payload formatting and fallback safety.
- **`JwtTokenProviderTest`**: Tests token generation, claim extraction, expiry enforcement, and tampering security.
- **`CorsSecurityTest`**: Verifies CORS pre-flight `OPTIONS` handshakes and headers.

### 2. Live Runtime User Journeys (`46 Passing`)
Executed live against running Spring Boot and Vite servers with active MySQL connectivity:
- ✅ Health check & server ping
- ✅ Admin & Customer authentication + JWT issuance
- ✅ New customer registration & BCrypt hashing
- ✅ Unauthenticated route blocking (HTTP 403)
- ✅ Customer blocked from Admin control panel (RBAC HTTP 403 Forbidden)
- ✅ 7 brand isolation checks (Nike, Jordan, Adidas, Yeezy, New Balance, Converse, Puma)
- ✅ Compound brand & category filtering (`Jordan + Basketball`)
- ✅ Search keyword scoping (`'Air'`)
- ✅ Dynamic price sort validation (ascending/descending)
- ✅ Size Advisor computation with brand-to-brand offset
- ✅ Content similarity recommendations (4 matched sneakers)
- ✅ Cart item addition, quantity modification, and subtotal calculation
- ✅ Wishlist toggle, state check, and item retrieval
- ✅ Atomic order placement via Cash on Delivery
- ✅ Inventory variant decrement upon checkout
- ✅ Cart auto-clearing post checkout
- ✅ Customer order history retrieval
- ✅ Customer review posting with verified purchaser badge
- ✅ Admin KPI statistics retrieval
- ✅ Admin order status transition (`PLACED` &rarr; `CONFIRMED` &rarr; `SHIPPED`)
- ✅ Admin customer list auditing
- ✅ Newsletter subscription with Brevo API dispatch and duplicate idempotency

---

## 💻 Local Setup & Installation

### Prerequisites
- **Java Development Kit (JDK)**: Version 17 or 21+ (`java -version`)
- **Apache Maven**: Version 3.8+ (`mvn -version` or use provided `./mvnw.cmd`)
- **Node.js**: Version 18.0.0+ (`node -v`)
- **npm**: Version 9.0.0+ (`npm -v`)
- **Database Option**:
  - **Zero-Setup (Recommended for quick evaluation)**: Embedded in-memory **H2 Database** (requires no MySQL installation).
  - **OR Local MySQL**: MySQL 8.0+ running on port 3306.
  - *(Note: Production runs on managed **Aiven Cloud MySQL** with SSL/TLS encryption).*

---

### Step 1: Clone Repository
```bash
git clone https://github.com/om-rindhe24/sneakx-ecommerce.git
cd sneakx-ecommerce
```

---

### Step 2: Backend Configuration & Startup

Choose whichever database option is most convenient:

#### Option A: Zero-Setup In-Memory H2 (Recommended for Fast Preview)
No MySQL installation required. Tables and seed data (37 sneakers, 7 brands, roles) are initialized automatically in memory:
```bash
cd backend
mvn clean spring-boot:run -Dspring-boot.run.profiles=h2
```

#### Option B: Local or Cloud MySQL (Production-Parity)
1. If using local MySQL, create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS sneakx_db;
   ```
2. Set your environment variables (or rely on defaults in `application.yml`):

   | Variable Name | Description | Default / Example Value |
   | :--- | :--- | :--- |
   | `DB_HOST` | MySQL hostname | `localhost` (or cloud host) |
   | `DB_PORT` | MySQL port | `3306` |
   | `DB_NAME` | Database name | `sneakx_db` |
   | `DB_USERNAME` | MySQL user | `root` (or cloud user) |
   | `DB_PASSWORD` | MySQL user password | *(your local/cloud password)* |
   | `DB_SSL_MODE` | SSL requirement | `PREFERRED` (or `REQUIRED` for cloud) |
   | `JWT_SECRET` | 256-bit signing key | *(min 32 character secret)* |
   | `JWT_EXPIRATION` | Token expiry in ms | `86400000` (24 hours) |
   | `PORT` | Server listening port | `8080` |
   | `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |
   | `BREVO_API_KEY` | *(Optional)* Brevo v3 key | `xkeysib-...` |
   | `BREVO_FROM_EMAIL`| *(Optional)* Verified sender | `orders@sneakx.com` |
   | `MAIL_HOST` | *(Optional)* SMTP host | `smtp.gmail.com` |
   | `MAIL_PORT` | *(Optional)* SMTP port | `587` |
   | `MAIL_USERNAME` | *(Optional)* SMTP user | `your-email@gmail.com` |
   | `MAIL_PASSWORD` | *(Optional)* SMTP app password | `your-16-char-app-password` |
   | `RAZORPAY_KEY_ID` | *(Optional)* Razorpay Key ID | `rzp_test_...` |
   | `RAZORPAY_KEY_SECRET` | *(Optional)* Razorpay Secret | `...` |

   > **Note on Email & Payments**: If `BREVO_API_KEY` and `MAIL_HOST` are omitted, SneakX operates in **Safe Development Fallback Mode**, generating formatted order receipts directly to server console logs without crashing or failing checkout.

3. Start the backend:
   ```bash
   cd backend
   mvn clean spring-boot:run
   ```
   *The backend will boot on `http://localhost:8080`.*

---

### Step 3: Frontend Configuration & Startup

1. **Navigate to Frontend Directory**:
   ```bash
   cd ../frontend
   ```

2. **Configure `.env`**:  
   Create `frontend/.env`:
   ```properties
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

3. **Install Dependencies & Start Dev Server**:
   ```bash
   npm install
   npm run dev
   ```
   *The application will be accessible at `http://localhost:5173`.*

---

### Step 4: Production Build Validation

```bash
# Frontend bundle verification
cd frontend
npm run build

# Backend package verification
cd ../backend
mvn clean package -DskipTests
```

---

## 🔮 Future Enhancements

- [ ] **Redis Caching Layer**: Cache hot product queries and brand catalog listings to achieve sub-10ms response times.
- [ ] **Elasticsearch / Typesense Integration**: Instant fuzzy search with typo tolerance and auto-suggestions.
- [ ] **Webhook Event Listeners**: Asynchronous webhook handler for Razorpay payment captures and refunds.
- [ ] **Sneaker Drop Raffles**: Fair-queue randomized raffle lottery system for hyper-limited releases.
- [ ] **3D Sneaker Inspector**: Three.js / WebGL interactive 360-degree sneaker previewer.
- [ ] **Multi-Currency & International Shipping**: Dynamic currency switcher with real-time conversion rates.

---

## 👨‍💻 Author & Contact

**Om Rindhe**  
Full-Stack Software Engineer  
- **GitHub**: [@om-rindhe24](https://github.com/om-rindhe24)  
- **Email**: [rindheom261@gmail.com](mailto:rindheom261@gmail.com)  
- **Repository**: [https://github.com/om-rindhe24/sneakx-ecommerce](https://github.com/om-rindhe24/sneakx-ecommerce)

---

## 📄 License

This project is licensed under the **MIT License** — feel free to explore, clone, and build upon it.
