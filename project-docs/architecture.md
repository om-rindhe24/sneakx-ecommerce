# SneakX — Technical Architecture

## 1. High-Level Architecture Overview

SneakX follows a clean, decoupled, layered monolithic architecture. The system is split into two primary subsystems: a high-performance Java Spring Boot RESTful backend and a responsive, aesthetic React (Vite) single-page application (SPA), communicating over standard JSON REST APIs.

```
+-------------------------------------------------------------------+
|                        React Frontend (SPA)                       |
|   Components | Pages | Hooks | Context (Auth/Cart) | API Services  |
+---------------------------------+---------------------------------+
                                  | HTTP / JSON (Axios / Fetch)
                                  v
+-------------------------------------------------------------------+
|                     Spring Boot 3.x REST API                      |
|                                                                   |
|  [Security Filter Chain]  -->  JWT Authentication & Authorization  |
|                                                                   |
|  [Controller Layer]       -->  REST Endpoints, DTO Validation      |
|                                                                   |
|  [Service Layer]          -->  Business Logic, @Transactional     |
|                                                                   |
|  [Repository Layer]       -->  Spring Data JPA, JPQL, Criteria     |
|                                                                   |
|  [Entity / Model Layer]   -->  JPA Entities, Table Mappings       |
+---------------------------------+---------------------------------+
                                  | JDBC / HikariCP Pool
                                  v
+-------------------------------------------------------------------+
|                         MySQL 8.0 Database                        |
|   Normalized 3NF Tables | Foreign Keys | Indexes | Constraints    |
+-------------------------------------------------------------------+
```

---

## 2. Frontend Architecture (React + Vite)

The frontend is structured around feature-driven separation of concerns, utilizing React 18, React Router for client-side navigation, and Context API for global state (Authentication, Shopping Cart, Notifications).

### Key Subsystems:
- **Routing & Guards**: Protected routes (`<ProtectedRoute role="ROLE_ADMIN" />`) guard administrative and authenticated user views.
- **State Management**:
  - `AuthContext`: Holds current JWT, decoded user claims, login/logout functions.
  - `CartContext`: Local-first optimistic UI with server-synchronized cart persistence.
  - `WishlistContext`: Quick-toggle sneaker bookmarking.
- **HTTP Client**: Axios instance configured with base URL, standard request interceptors (attaching `Authorization: Bearer <token>`), and response interceptors (handling 401 token expiry and standard error responses).
- **Design System Integration**: Pure CSS variables (`design-tokens.css`) defining typography, colors, elevations, and layout grids to ensure visual consistency without bulky CSS frameworks.

---

## 3. Backend Layered Architecture (Spring Boot 3.x)

The backend strictly enforces the single-responsibility principle across five core layers:

### 3.1 Controller Layer (`@RestController`)
- Exposes standardized REST endpoints.
- Accepts and produces JSON representations.
- Performs declarative input validation using `jakarta.validation` annotations (`@Valid`, `@NotNull`, `@Size`, `@Email`).
- Translates incoming HTTP requests into service calls and returns uniform `ApiResponse<T>` envelopes.
- **Never contains business logic or direct database queries.**

### 3.2 Service Layer (`@Service`)
- Implements core business logic and workflows (e.g., checkout sequence, recommendation calculations, size translations).
- Manages transactional boundaries using `@Transactional(rollbackFor = Exception.class)`.
- Handles data transformation between JPA Entities and Request/Response Data Transfer Objects (DTOs).
- Throws domain-specific business exceptions (e.g., `ResourceNotFoundException`, `InsufficientStockException`, `UnauthorizedAccessException`).

### 3.3 Repository Layer (`@Repository`)
- Extends `JpaRepository<Entity, ID>` and `JpaSpecificationExecutor<Entity>`.
- Provides type-safe persistence operations.
- Implements custom JPQL queries and JPA Specifications for multi-criteria dynamic filtering (search by brand, size, min/max price, color).
- Leverages database indexes on high-frequency query fields (`brand_id`, `category_id`, `price`, `sku`).

### 3.4 Entity / Model Layer (`@Entity`)
- Object-Relational Mapping (ORM) classes mapped to MySQL tables via Hibernate.
- Utilizes a common `BaseEntity` providing audit fields (`createdAt`, `updatedAt`).
- Defines relational mappings (`@ManyToOne`, `@OneToMany`, `@ManyToMany`) with explicit cascade rules and fetch strategies (preferring `FetchType.LAZY` to avoid N+1 query traps).

---

## 4. Authentication & Authorization Architecture

SneakX uses stateless **JSON Web Token (JWT)** security:

```
[Client] ---> POST /api/auth/login {email, password}
         <--- 200 OK {token, user: {id, email, role}}

[Client] ---> GET /api/orders (Headers: Authorization: Bearer <token>)
         ---> [JwtAuthenticationFilter] verifies signature & expiration
         ---> Sets SecurityContextHolder with UserPrincipal & GrantedAuthorities
         ---> Controller executes if @PreAuthorize allows
```

- **Password Hashing**: Passwords stored as salted BCrypt hashes (`BCryptPasswordEncoder`, strength = 12).
- **Token Claims**: Contains user subject (email/ID), role (`ROLE_USER` or `ROLE_ADMIN`), issued timestamp, and expiration timestamp (e.g., 24 hours).
- **Filter Chain**: Custom `JwtAuthenticationFilter` executes before `UsernamePasswordAuthenticationFilter`.
- **Role Enforcement**:
  - Public endpoints: `/api/auth/**`, `/api/products/**`, `/api/categories/**`, `/api/brands/**`
  - User endpoints: `/api/cart/**`, `/api/orders/**`, `/api/reviews/**`, `/api/wishlist/**` (`ROLE_USER` or `ROLE_ADMIN`)
  - Admin endpoints: `/api/admin/**` (Strictly `ROLE_ADMIN`)

---

## 5. API Communication & Standard Envelopes

All REST responses adhere to a predictable contract:

### Success Response:
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "content": [...],
    "page": 0,
    "size": 12,
    "totalElements": 48,
    "totalPages": 4,
    "last": false
  },
  "timestamp": "2026-09-06T10:15:30Z"
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Must be a well-formed email address"
    }
  ],
  "timestamp": "2026-09-06T10:15:30Z"
}
```

---

## 6. Exception Handling & Validation Architecture

A centralized `@RestControllerAdvice` class (`GlobalExceptionHandler`) intercepts all unhandled and domain-specific exceptions:
- `MethodArgumentNotValidException` ➔ 400 Bad Request with field-level error mapping.
- `ResourceNotFoundException` ➔ 404 Not Found.
- `BadRequestException` / `InsufficientStockException` ➔ 400 Bad Request.
- `BadCredentialsException` / `AuthenticationException` ➔ 401 Unauthorized.
- `AccessDeniedException` ➔ 403 Forbidden.
- `Exception` (catch-all) ➔ 500 Internal Server Error with sanitized logging (stack trace withheld from client).

---

## 7. Database Connection & Concurrency Strategy

- **Connection Pool**: HikariCP (configured with maximum pool size, idle timeout, and leak detection).
- **Transaction Management**: Spring's `@Transactional` ensures atomic checkout:
  1. Verify variant stock availability.
  2. Deduct variant stock (`stock_quantity = stock_quantity - order_quantity`).
  3. Create `Order` record and associated `OrderItem` line items.
  4. Clear user's active cart.
  If any step fails, the entire transaction rolls back cleanly.

---

## 8. Directory & Folder Structure

```
sneakx/
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/sneakx/
│       │   │   ├── SneakXApplication.java
│       │   │   ├── config/              # Security, CORS, Swagger, JPA Auditing
│       │   │   ├── controller/          # REST Controllers (Auth, Product, Cart, Order, Admin)
│       │   │   ├── dto/                 # Request/Response Data Transfer Objects
│       │   │   ├── entity/              # JPA Entities (User, Product, Variant, Order, etc.)
│       │   │   ├── exception/           # Custom Exceptions & GlobalExceptionHandler
│       │   │   ├── repository/         # Spring Data JPA Repositories
│       │   │   ├── security/           # JWT Provider, Auth Filter, UserDetailsService
│       │   │   ├── service/            # Service Interfaces & Implementations
│       │   │   └── util/               # Constants, Helpers, Mappers
│       │   └── resources/
│       │       ├── application.yml     # Spring configurations & profiles
│       │       ├── application-dev.yml
│       │       └── data.sql            # Initial seeds (admin user, categories, brands)
│       └── test/java/com/sneakx/        # Unit & Integration Tests
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── assets/                     # Logos, static icons, SVG assets
│       ├── components/                 # Reusable UI (Navbar, Footer, ProductCard, Modal, Button)
│       ├── context/                    # AuthContext, CartContext, WishlistContext
│       ├── hooks/                      # Custom hooks (useAuth, useCart, useDebounce)
│       ├── pages/                      # Views (Home, Catalog, ProductDetail, Cart, Checkout, Admin)
│       ├── services/                   # Axios API services (authService, productService, orderService)
│       ├── styles/                     # Design tokens, global CSS, layout styles
│       └── utils/                      # Currency formatters, sizing helpers, constants
│
└── project-docs/                       # Persistent AI Project Memory (13 markdown files)
```
