# SneakX — REST API Specification & Documentation

## 1. Global API Conventions

### Base URL
- Local Development: `http://localhost:8080/api`
- Frontend Proxy: `/api`

### Standard Response Envelope (`ApiResponse<T>`)
Every API response returns a uniform JSON envelope:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-09-06T12:00:00Z"
}
```

### Standard Error Envelope
```json
{
  "success": false,
  "message": "Validation failed / Resource not found",
  "errors": [
    "size: US Size is required"
  ],
  "timestamp": "2026-09-06T12:00:00Z"
}
```

### Authentication Header
Protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 2. API Status Overview

| Module | Endpoints Planned | Implemented & Verified | Status |
| :--- | :--- | :--- | :--- |
| **Authentication** | 3 | 3 | **Implemented & Verified** |
| **Products & Catalog** | 7 | 7 | **Implemented & Verified** |
| **Cart** | 5 | 5 | **Implemented & Verified** |
| **Wishlist** | 3 | 3 | **Implemented & Verified** |
| **Checkout & Orders** | 3 | 3 | **Implemented & Verified** |
| **Reviews** | 2 | 2 | **Implemented & Verified** |
| **Recommendations** | 3 | 3 | **Implemented & Verified** |
| **Admin Controls** | 8 | 8 | **Implemented & Verified** |
| **Health** | 1 | 1 | **Implemented & Verified** |

---

## 3. Implemented REST Endpoints

### 3.1 Authentication
- `POST /api/auth/register` — Registers user, hashes password with BCrypt, initializes cart & wishlist, returns JWT token. *(Status: Implemented & Verified)*
- `POST /api/auth/login` — Authenticates credentials, issues stateless HMAC-SHA256 JWT with roles. *(Status: Implemented & Verified)*
- `GET /api/auth/me` — Fetches profile of current authenticated user from `SecurityContextHolder`. *(Status: Implemented & Verified)*

### 3.2 Product Catalog & Search
- `GET /api/products` — Paginated catalog with multi-criteria filtering (`brandId`, `categoryId`, `minPrice`, `maxPrice`, `gender`, `size`, `search`, `sort` [`newest`, `price_asc`, `price_desc`, `name_asc`, `name_desc`], `page`, `pageSize`). Supports strict brand isolation and variant size subquery. *(Status: Implemented & Verified)*
- `GET /api/products/{id}` — Full product details with images, size variants, and reviews. *(Status: Implemented & Verified)*
- `GET /api/products/slug/{slug}` — Product lookup by SEO URL slug. *(Status: Implemented & Verified)*
- `GET /api/products/featured` — Featured high-heat sneaker drops. *(Status: Implemented & Verified)*
- `GET /api/products/new-releases` — 8 newest arrivals ordered by creation timestamp. *(Status: Implemented & Verified)*
- `GET /api/brands` — List of all active footwear brands (Nike, Jordan, Adidas, Yeezy, New Balance, Converse, Puma). *(Status: Implemented & Verified)*
- `GET /api/categories` — List of all footwear categories (Basketball, Lifestyle, Running, Skateboarding). *(Status: Implemented & Verified)*

### 3.3 Shopping Cart
- `GET /api/cart` — User cart with itemized lines, quantity, stock check, subtotal, and free shipping logic. *(Status: Implemented & Verified)*
- `POST /api/cart/items` — Add variant to cart with stock quantity check. *(Status: Implemented & Verified)*
- `PUT /api/cart/items/{id}` — Update item quantity with real-time stock cap. *(Status: Implemented & Verified)*
- `DELETE /api/cart/items/{id}` — Remove line item from cart. *(Status: Implemented & Verified)*
- `DELETE /api/cart` — Clear entire shopping cart. *(Status: Implemented & Verified)*

### 3.4 Wishlist
- `GET /api/wishlist` — User's saved sneakers. *(Status: Implemented & Verified)*
- `POST /api/wishlist/toggle/{productId}` — Toggles sneaker bookmarking. *(Status: Implemented & Verified)*
- `GET /api/wishlist/check/{productId}` — Checks if product is bookmarked. *(Status: Implemented & Verified)*

### 3.5 Checkout & Orders
- `POST /api/orders/checkout` — Atomic `@Transactional` execution: checks variant stock, locks and deducts stock, creates order with immutable snapshots of sneaker name, size, SKU, and price, clears cart, records safe `paymentReference`, and triggers `EmailService` confirmation receipt. *(Status: Implemented & Verified)*
- `GET /api/orders` — Customer order history. *(Status: Implemented & Verified)*
- `GET /api/orders/{id}` — Specific order detail with line items, tracking ID, and delivery destination. *(Status: Implemented & Verified)*

### 3.6 Reviews & Ratings
- `GET /api/products/{productId}/reviews` — Approved customer reviews with ratings. *(Status: Implemented & Verified)*
- `POST /api/products/{productId}/reviews` — Submit verified purchase review. *(Status: Implemented & Verified)*

### 3.7 Recommendation & Size Advisor
- `GET /api/recommendations/products/{productId}` — Content-based similarity scoring (Category +3, Brand +2, Price +1). *(Status: Implemented & Verified)*
- `GET /api/recommendations/user` — Personalized recommendations based on wishlist/order history. *(Status: Implemented & Verified)*
- `POST /api/recommendations/size-advisor` — Brand-variance size offset algorithm. *(Status: Implemented & Verified)*

### 3.8 Admin Management (`ROLE_ADMIN`)
- `GET /api/admin/dashboard` — Platform KPIs: Total Revenue, Total Orders, Active Orders, Total Products, Registered Users, Low Stock Alerts. *(Status: Implemented & Verified)*
- `POST /api/admin/products` — Create new sneaker silhouette with variants and images. *(Status: Implemented & Verified)*
- `PUT /api/admin/products/{id}` — Update sneaker metadata. *(Status: Implemented & Verified)*
- `DELETE /api/admin/products/{id}` — Soft-deactivate product. *(Status: Implemented & Verified)*
- `PUT /api/admin/variants/{variantId}/stock` — Granular stock update for a specific size. *(Status: Implemented & Verified)*
- `GET /api/admin/users` — List of registered accounts with roles. *(Status: Implemented & Verified)*
- `GET /api/admin/orders` — View all customer orders. *(Status: Implemented & Verified)*
- `PUT /api/admin/orders/{orderId}/status` — Status transition (`CONFIRMED` -> `SHIPPED` -> `DELIVERED` -> `CANCELLED`). If cancelled, automatically restocks inventory. *(Status: Implemented & Verified)*

### 3.9 System Health
- `GET /api/health` — Service uptime, version, and server timestamp. *(Status: Implemented & Verified)*
