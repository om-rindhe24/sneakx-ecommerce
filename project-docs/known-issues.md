# SneakX — Known Issues & Bug Tracker

This document tracks real defects, anomalies, and blockers encountered during the development of SneakX.

---

## 1. Active Issues
- **Issue #003**: Playwright automated browser subagent driver CDN 404 error
  - **Severity**: Low (Tooling only, does not affect application functionality)
  - **Status**: Documented / Upstream Dependency
  - **Symptoms**: `open_browser_url` returns HTTP 404 when attempting to fetch `playwright-1.57.0-win32_x64.zip` from Microsoft CDN (`playwright.azureedge.net`).
  - **Impact**: Browser subagent headless UI execution is unavailable in the environment. Application itself runs natively and flawlessly on Vite (`http://localhost:5173`) and Spring Boot (`http://localhost:8080`). All flows verified via automated HTTP scripts.

---

### Issue #004: Brand Section Isolation & Cross-Brand Image Collisions
- **Severity**: Critical
- **Status**: Resolved
- **Date Discovered**: 2026-09-06
- **Date Resolved**: 2026-09-06
- **Symptoms**: Navigating to `/products?brand=Nike` or `/products?brand=Jordan` returned all 37 catalogue products instead of only that brand's products. Additionally, 11 seeded sneakers displayed images from rival brands (e.g. Yeezy Slide showed Nike Air Force 1; Adidas Campus showed Nike Panda; Puma Suede showed Nike SB Dunk; Travis Scott AJ1 showed red Nike Free runner).
- **Cause**:
  1. `ProductController.java` only accepted `@RequestParam Long brandId` and `Long categoryId`. When string brand/category queries (`?brand=Nike`) arrived, `brandId` remained `null`, causing the JPQL query (`:brandId IS NULL OR p.brand.id = :brandId`) to bypass brand filtering.
  2. `CatalogPage.jsx` read `searchParams.get('brandId')` but ignored `brand`, while `searchParams.get('category')` passed raw strings like `"Basketball"` that evaluated to `NaN` when cast to numbers.
  3. Reused Unsplash photo IDs across brands in `DataInitializer.java`.
- **Final Solution**:
  1. Added `@RequestParam String brand` and `String category` to `ProductController.java` and `ProductService.java`. If string is provided, resolves to `Brand` entity ID via `brandRepository.findBySlug(...)` or `findByNameIgnoreCase(...)`. Invalid brands resolve to `-1L`, returning 0 products (never leaking all products).
  2. Updated `CatalogPage.jsx` to synchronize and support both `brand`/`brandId` and `category`/`categoryId`. Clears state immediately on filter change and cancels obsolete in-flight requests.
  3. Audited all 37 seeded sneakers and replaced all 11 colliding Unsplash photo IDs with verified, distinct, brand-authentic imagery (HTTP 200).
  4. Added `ProductIsolationAndOrderTest.java` verifying 100% brand isolation, Brand + Category, Brand + Search, and Brand + Sort. Automated tests: 10/10 passing.


---

### Issue Template Reference:
```markdown
### Issue #ID: [Short Description]
- **Severity**: Low | Medium | High | Critical
- **Status**: Open | Investigating | Resolved
- **Date Discovered**: YYYY-MM-DD
- **Date Resolved**: YYYY-MM-DD (or pending)
- **Symptoms**: What unexpected behavior occurred? Include error traces or HTTP status codes.
- **Cause**: Root cause identified in the code or environment.
- **Attempted Fix**: What actions were taken initially?
- **Final Solution**: The concrete patch or code change that permanently fixed the issue.
```
