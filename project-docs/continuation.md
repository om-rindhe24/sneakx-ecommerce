# SneakX — Project Continuation & Session Handover

**Timestamp**: 2026-09-28T10:45:00+05:30  
**Project**: SneakX — Smart Sneaker E-commerce Platform  
**Current Phase**: Phase 26 (Coupon & Discount Codes Engine)  
**Status**: Features fully implemented, verified, and documented. Backend 44/44 tests passing; frontend production build 0 errors.

---

## 1. Executive Summary of Recent Milestones

1. **Coupon & Discount Codes Engine (Phase 26)**:
   - Full coupon lifecycle implemented on both customer and admin sides.
   - **Customer Experience**:
     - Interactive "Apply coupon" card in Checkout page Order Summary.
     - Dynamic Discount line item between Subtotal and Tax/Shipping.
     - Final Total updates instantly; provides clear inline error messaging for expired/ineligible codes and a "Remove" option.
     - Server-side discount validation and calculation prevents client tampering.
     - Synchronized with Razorpay payment orders and COD orders so exact discounted amount is charged.
     - Order Confirmation page and Customer Orders page render applied coupon and discount amounts.
     - HTML confirmation email receipts itemize coupon discount.
   - **Coupon Rules Engine**:
     - Supports `PERCENTAGE` discounts (with optional `maxDiscountAmount` cap) and `FLAT` amount discounts.
     - Enforces `minOrderAmount`, `expiryDate`, `totalUsageLimit`, and `onePerUser` restrictions.
     - Automatic usage counter incrementation on successful checkout.
   - **Admin Portal**:
     - Dedicated Coupon Management tab in Admin Dashboard (`/admin`).
     - Create coupons, list existing coupons with usage statistics, toggle active/inactive status, and delete coupons.
   - **Sample Seed Data**:
     - `SNEAK10`: 10% off (max ₹2,500) on orders over ₹3,000.
     - `FLAT500`: Flat ₹500 off on orders over ₹4,000.
     - `GRAIL20`: 20% off (max ₹5,000) on orders over ₹10,000.
2. **Saved Addresses at Checkout (Phase 24)**:
   - Full-stack Amazon/Myntra-style address management integrated directly into the Checkout page (`/checkout`).
   - Authenticated users can choose from previously saved address cards with default pre-selection, or click "+ Add New Address" to reveal the form with an inline cancel option.
   - Guest and first-time users continue seeing the blank address form seamlessly.
   - Backend exposes user-scoped REST endpoints (`GET`, `POST`, `PUT /{id}`, `DELETE /{id}`, `PATCH /{id}/default` under `/api/addresses`) with strict `@AuthenticationPrincipal` ownership verification.
   - Orders can be placed using `addressId` or new address fields (with optional `saveAddress: true` flag).
3. **Checkout Order Summary Price Breakdown (Phase 25)**:
   - Added visible `Tax: Included in price (18% GST)` line item between Subtotal and Shipping in the Checkout page order summary card.
   - Matches the wording and formatting from the order confirmation receipt (`EmailService.java`) while adopting the checkout page's dark theme design system (`var(--text-secondary)`, `var(--text-muted)`).
   - Charged amounts and calculation logic remain 100% unaltered.
4. **Security Hardening & Repository Sanitization (Phase 23)**:
   - Sanitized credentials across the repository; removed public test credentials from `README.md`.
   - Replaced hardcoded credentials with environment variables (`ADMIN_INITIAL_PASSWORD`, `DEMO_CUSTOMER_PASSWORD`).
   - Removed PII (real phone numbers replaced with placeholders) and sanitized JWT secret fallbacks.
   - Synchronized live Aiven Cloud MySQL database passwords with BCrypt hashes.
5. **Verification Status**:
   - Backend: `mvn test` -> **44 / 44 tests passed** (BUILD SUCCESS).
   - Frontend: `npm run build` -> **0 errors, 0 warnings** (Vite production bundle created in 14.00s).

---

## 2. Issue 1: Forensic Image Audit & Asset Pipeline Status

### Specific Mismatches Discovered During Visual Inspection:
| # | Product Name | Brand | Original Mismatched Photo | Root Defect |
|---|---|---|---|---|
| 2 | Air Jordan 4 Retro Military Black | Jordan | Red Air Jordan 12 | Wrong silhouette & colorway |
| 3 | Air Jordan 3 Retro White Cement | Jordan | Air Jordan 1 Low on street | Wrong silhouette |
| 4 | Air Jordan 11 Retro Gratitude | Jordan | White Puma shoe | Rival brand |
| 5 | Travis Scott AJ1 Low Reverse Mocha | Jordan | Clothing rack with hanging jeans | Non-shoe item |
| 6 | Air Jordan 4 Retro Bred Reimagined | Jordan | White Nike Air Force 1 High | Wrong brand & silhouette |
| 7 | Air Jordan 1 High Lost and Found | Jordan | Neon blue Nike Air Max 90 | Wrong brand & silhouette |
| 8 | Nike Dunk Low Retro Panda | Nike | Air Jordan 1 Mid with Wings logo | Jordan branding instead of Nike Dunk |
| 9 | Nike Air Force 1 07 Triple White | Nike | Orange Nike Air Max 1 Ultra | Wrong silhouette & color |
| 11 | Nike SB Dunk Low Pro Chicago | Nike | Dumbbells & resistance bands on table | Gym equipment |
| 12 | Nike Zoom Vomero 5 Photon Dust | Nike | Neon green Nike SuperRep trainer | Fitness trainer |
| 13 | Nike Ja 1 Day One | Nike | Nike Air Force 1 React | Wrong model |
| 14 | Nike Air Max 1 86 Big Bubble | Nike | Blue floral Aldo high heels | Women's high heel pumps |
| 15 | Nike Air Zoom Pegasus 40 | Nike | Black backpack | Bag / non-shoe item |
| 16 | Adidas Samba Classic Cloud White | Adidas | Adidas EQT 91/18 runner | Wrong silhouette |
| 17 | Adidas Gazelle Indoor Blue | Adidas | Adidas Deerupt runner | Wrong silhouette |
| 18 | Adidas Ultraboost Light Core Black | Adidas | White dress shoe with stars | Generic non-athletic shoe |
| 19 | Adidas Superstar OG White Black | Adidas | Burgundy Vans Old Skool | Rival brand |
| 20 | Adidas Forum Low Royal Blue | Adidas | K-Swiss trainer | Rival brand |
| 21 | Adidas Campus 00s Core Black | Adidas | Air Jordan 1 High Obsidian | Rival brand |
| 22 | Yeezy Boost 350 V2 Zebra | Yeezy | Nike Air Max 90 on purple hand | Rival brand |
| 23 | Yeezy Boost 700 Wave Runner | Yeezy | Person in hoodie flying a drone | Non-shoe item |
| 24 | Yeezy Slide Onyx | Yeezy | Beige leather dress shoe | Casual shoe |
| 25 | Yeezy Foam Runner Onyx | Yeezy | Blue Air Jordan 1 Flyknit | Rival brand |
| 26 | Yeezy Boost 350 V2 Bone | Yeezy | Orange Nike Air Max 1 Ultra | Rival brand |
| 27 | New Balance 550 White Green | New Balance | Multicolored fashion sneaker | Generic non-NB sneaker |
| 29 | New Balance 2002R Rain Cloud | New Balance | Brown Nike Carhartt Air Force 1 | Rival brand |
| 30 | New Balance 1906R Silver Metallic | New Balance | Nike Stefan Janoski Max | Rival brand |
| 31 | New Balance 9060 Sea Salt Concrete | New Balance | Black Nike running shoe | Rival brand |
| 34 | Converse Run Star Hike Platform | Converse | Beat-up worn-out pink Converse | Damaged / wrong model |
| 36 | Puma Palermo Vapour Grey Gum | Puma | Underground parking garage | Architectural / parking lot |
| 37 | Puma MB.03 LaMelo Ball Toxic | Puma | Black Nike Air Force 1 | Rival brand |

### Assets Verified & Saved in `frontend/public/images/products/`:
1. `air-jordan-1-retro-high-og-chicago.jpg` (Confirmed authentic AJ1 Chicago)
2. `air-jordan-4-retro-military-black.jpg` (4K studio photography of AJ4 Military Black)
3. `travis-scott-air-jordan-1-low-reverse-mocha.jpg` (4K studio photography of Reverse Mocha AJ1 Low)
4. `air-jordan-11-retro-gratitude.jpg` (4K studio photography of AJ11 Gratitude patent leather)
5. `nike-air-force-1-07-triple-white.jpg` (Official Nike CDN AF1 Triple White)
6. `nike-air-max-90-infrared.jpg` (Official Nike CDN Air Max 90)
7. `nike-air-zoom-pegasus-40.jpg` (Official Nike CDN Pegasus runner)
8. `adidas-superstar-og.jpg` (Official Adidas CDN Superstar)
9. `adidas-forum-low-royal.jpg` (Confirmed authentic Adidas Forum Low)
10. `adidas-ultraboost-light-core-black.jpg` (Confirmed authentic Adidas Ultraboost)
11. `converse-chuck-70-high-black.jpg` (Confirmed authentic Converse Chuck 70 High)
12. `puma-suede-classic-xxi.jpg` (Confirmed authentic Puma Suede Classic)
13. `puma-palermo-vapour-grey.jpg` (Confirmed authentic Puma Palermo/Ralph)

---

## 3. Immediate Resume Plan for Tomorrow

### Step 1: Complete Remaining 24 Sneaker Assets (Issue 1)
- Generate/download the remaining 24 assets directly into `frontend/public/images/products/`:
  - Jordan (3): AJ3 White Cement, AJ4 Bred, AJ1 Lost & Found.
  - Nike (4): Dunk Low Panda, SB Dunk Chicago, Vomero 5, Ja 1, Air Max 1 Big Bubble.
  - Adidas (3): Samba Classic White, Gazelle Indoor Blue, Campus 00s Black.
  - Yeezy (5): Boost 350 Zebra, Boost 700 Wave Runner, Slide Onyx, Foam Runner Onyx, 350 V2 Bone.
  - New Balance (5): 550 White Green, 990v6 Grey, 2002R Rain Cloud, 1906R Silver, 9060 Sea Salt.
  - Converse (2): Chuck Taylor Low Optical White, Run Star Hike Platform.
  - Puma (1): MB.03 Toxic.

### Step 2: Update `DataInitializer.java` & Live Aiven MySQL (Issue 1)
- Update `backend/src/main/java/com/sneakx/util/DataInitializer.java` with local `/images/products/<slug>.jpg` URLs.
- Run a one-time database updater script (`UpdateAivenProductImages.java`) to update the 37 product image URLs in the live Aiven MySQL database without dropping orders or user accounts.
- Verify via `/api/products?pageSize=50` that all 37 products return their updated image URLs.

### Step 3: Polish Design & Fix Atmospheric Backdrop (Issue 2)
1. **Fix `AtmosphericBackdrop.jsx`**:
   - Remove `mix-blend-mode: luminosity` (which was causing images to be crushed into pure black).
   - Set opacity to `0.14 - 0.18`.
   - Add subtle radial vignette mask so edges fade gracefully into `#0B0C0E`.
2. **Add Catalog/Grid Background Watermark**:
   - Add a large, subtle (5-8% opacity) sneaker silhouette or brand motif watermark behind the catalog and product grid sections.
3. **Add Subtle Noise/Grain Texture**:
   - Add CSS grain overlay to the dark background for high-end tactile feel.
4. **Refine Card Shadows & Hover States**:
   - Elevate card shadows: `box-shadow: 0 16px 40px -4px rgba(0, 0, 0, 0.7)`.
   - Hover state: accent border glow (`0 0 0 1px rgba(255, 59, 48, 0.5), 0 20px 45px -5px rgba(255, 59, 48, 0.2)`).
5. **Add Viewport Fade-in Stagger Animation**:
   - Add CSS animation `@keyframes cardFadeIn` with 60ms stagger delay per card.
6. **Spacing Consistency**:
   - Ensure uniform 24px/32px grid gaps and balanced container padding.

---

## 4. How to Start the App Tomorrow

```powershell
# 1. Start Backend with Aiven MySQL Profile
$env:SPRING_PROFILES_ACTIVE = "mysql"
cd "c:\Users\rindh\OneDrive\Documents\Ecommerce SneakX"
java -jar backend\target\sneakx-backend-0.0.1-SNAPSHOT.jar
# Backend runs on http://localhost:8080

# 2. Start Frontend Dev Server
cd "c:\Users\rindh\OneDrive\Documents\Ecommerce SneakX\frontend"
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 5. Key Architecture Constraints to Preserve
- Do NOT modify the database schema or drop foreign key constraints.
- Cart, JWT Authentication, and simulated checkout flows must remain 100% operational.
- Keep `SPRING_PROFILES_ACTIVE=mysql` active for live Aiven cloud database persistence.
