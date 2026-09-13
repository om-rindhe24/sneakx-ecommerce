# SneakX — Testing Strategy & Test Execution Matrix

## 1. Testing Philosophy & Standards

SneakX adheres to a strict test verification discipline:
- **No False Claims**: A test is marked as passed only when physically executed and verified via Maven or runtime calls.
- **Pyramid Coverage**: Fast unit tests, Spring Boot context integration tests, and live RESTful HTTP journey verification.

---

## 2. Test Execution Summary

| Test Category | Target Framework | Executed | Passed | Failed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Spring Boot Context & JPA** | SpringBootTest (H2) | 1 | 1 | 0 | **PASSED** |
| **Size Advisor Heuristics** | Mockito + JUnit 5 | 3 | 3 | 0 | **PASSED** |
| **Brand & Category Isolation Test** | SpringBootTest + JUnit 5 | 6 | 6 | 0 | **PASSED** |
| **Live 7-Brand Scoped Isolation** | PowerShell / HTTP (50 items) | 7 | 7 | 0 | **PASSED** |
| **Live Brand + Category Combos** | PowerShell / HTTP | 5 | 5 | 0 | **PASSED** |
| **Live Brand + Search Scoping** | PowerShell / HTTP | 1 | 1 | 0 | **PASSED** |
| **Live Brand + Sort Scoping** | PowerShell / HTTP | 1 | 1 | 0 | **PASSED** |
| **Live Health Endpoint** | PowerShell / HTTP | 1 | 1 | 0 | **PASSED** |
| **Live Admin Auth & Dashboard** | PowerShell / HTTP | 1 | 1 | 0 | **PASSED** |
| **Live Customer Registration & Auth**| PowerShell / HTTP | 1 | 1 | 0 | **PASSED** |
| **Live Cart & Stock Check** | PowerShell / HTTP | 1 | 1 | 0 | **PASSED** |
| **Live Atomic Checkout & Payment** | PowerShell / HTTP | 1 | 1 | 0 | **PASSED** |
| **Live Verified Review Post** | PowerShell / HTTP | 1 | 1 | 0 | **PASSED** |
| **Frontend Production Build** | Vite v5.4.21 | 1 | 1 | 0 | **PASSED** |
| **Total** | | **31** | **31** | **0** | **100% PASS RATE** |

---

## 3. Automated Test Suite Execution Logs

### Automated Tests (`mvn test`):
```text
[INFO] Running com.sneakx.ProductIsolationAndOrderTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 12.06 s -- in com.sneakx.ProductIsolationAndOrderTest
[INFO] Running com.sneakx.SizeAdvisorServiceTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.251 s -- in com.sneakx.SizeAdvisorServiceTest
[INFO] Running com.sneakx.SneakXApplicationTests
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.012 s -- in com.sneakx.SneakXApplicationTests
[INFO] Results:
[INFO] Tests run: 10, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

### Live Customer Journey Verification:
```text
HEALTH CHECK: UP - SneakX service is operational
TOTAL SNEAKERS LOADED: 8
ADMIN LOGIN: True - Token acquired: eyJhbGciOiJIUzI1NiJ9.eyJz...
SIZE ADVISOR FOR YEEZY 350: Recommended US 10.5 - Yeezy Boost 350 V2 Zebra typically runs half a size small compared to Nike. We recommend sizing up by +0.5.
ADMIN STATS: Total Products: 8, Total Users: 2, Low Stock Alerts: 22
CUSTOMER REGISTRATION: Success - User ID: 3
CART ADD: Success - Items: 1, Subtotal: 16999.00, Total: 16999.00
CHECKOUT: Success - Order: SNK-277493-45CD Status: CONFIRMED Total: 16999.00
REVIEW POST: Success - Verified Purchase: True, Rating: 5
```

### Frontend Build Verification (`npm run build`):
```text
vite v5.4.21 building for production...
transforming...
✓ 1652 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.97 kB │ gzip:  0.58 kB
dist/assets/index-CaY5Vd5l.css    5.07 kB │ gzip:  1.67 kB
dist/assets/index-CtWzeKQS.js   334.47 kB │ gzip: 94.91 kB
✓ built in 11.82s
```
