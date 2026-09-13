# SneakX — Architectural & Technical Decisions Log

This document records high-impact architectural and technical decisions made during the lifecycle of the SneakX project.

---

### Decision 1: Monolithic Clean Layered Architecture over Microservices
- **Date**: 2026-09-06
- **Reason**: The project requires robust business logic, reliable transactional integrity (e.g. checkout and stock deduction), and high maintainability for a college project and placement interviews.
- **Alternatives**:
  - *Microservices (Auth service, Product service, Order service, etc.)*: Massive overhead in inter-service communication (gRPC/Kafka/Feign), distributed transactions (Saga pattern), deployment complexity, and debugging friction.
  - *Serverless Functions (AWS Lambda / Firebase)*: Fragmented state, cold-start latency, vendor lock-in, and diminished demonstration of core Java/Spring Boot framework fundamentals.
- **Why Selected**: A modular monolith with clean package separation enforces domain boundaries while allowing simple local execution, atomic ACID transactions, unified logging, and single-command deployment without unnecessary DevOps overhead.
- **Impact**: Codebase is cohesive, easier to test, simpler to explain in interviews, and eliminates distributed transaction failures.

---

### Decision 2: Java 17+ and Spring Boot 3.x for Backend
- **Date**: 2026-09-06
- **Reason**: Enterprise standards, high type safety, rich ecosystem (Spring Security, Spring Data JPA), and strong alignment with software engineering placement criteria.
- **Alternatives**:
  - *Node.js / Express*: Faster initial setup, but weaker type guarantees (even with TypeScript compared to strict Java), lack of built-in enterprise ORM tooling matching JPA, and less favored in core backend interview evaluations.
  - *Python / Django*: Built-in admin is convenient, but Python is less frequently required for enterprise backend roles compared to Java/Spring Boot.
- **Why Selected**: Spring Boot 3 provides modern Java features (records, enhanced pattern matching), first-class JPA integration, robust security filters, and production-grade connection management via HikariCP.
- **Impact**: Provides an enterprise-grade backend portfolio demonstration directly applicable to top tech company job descriptions.

---

### Decision 3: MySQL 8.0 Relational Database with InnoDB
- **Date**: 2026-09-06
- **Reason**: E-commerce data is inherently relational: users place orders, orders comprise line items, items correspond to product variants, and inventory must adhere strictly to ACID properties.
- **Alternatives**:
  - *MongoDB (NoSQL)*: Schema flexibility is appealing, but handling variant inventory deduction without strict multi-document ACID transactions easily introduces overselling bugs and phantom reads.
  - *PostgreSQL*: Excellent alternative; MySQL was chosen due to ubiquitous availability in placement curriculums, standard Docker images, and reliable Spring Data JPA dialect support.
- **Why Selected**: MySQL InnoDB engine guarantees ACID transactions, row-level locking for inventory mutation during high-concurrency checkout drops, and robust foreign key integrity.
- **Impact**: Zero phantom inventory anomalies; schema is normalized to 3NF, demonstrating database design acumen.

---

### Decision 4: Stateless JWT Authentication with Role-Based Access Control
- **Date**: 2026-09-06
- **Reason**: Decoupling authentication state from server memory allows seamless communication between the decoupled React single-page application and the Spring Boot REST API.
- **Alternatives**:
  - *Server-side HTTP Sessions (JSESSIONID)*: Requires session sticky routing or Redis session store if scaled; introduces CSRF complexities in single-page apps.
  - *OAuth2 / Third-party only (Google/GitHub)*: High initial configuration; interviewers expect a demonstration of custom authentication logic (password hashing, credential validation, JWT signature verification).
- **Why Selected**: Stateless JWT with HMAC-SHA256 signature enables scalable, self-contained authorization claims (`ROLE_USER`, `ROLE_ADMIN`) that can be parsed instantly in Spring Security filters without repeated database queries per request.
- **Impact**: Clean RESTful architecture; straightforward integration with Axios interceptors on the React client.

---

### Decision 5: Two-Tier Entity Hierarchy: Product and ProductVariant
- **Date**: 2026-09-06
- **Reason**: In sneaker retail, a sneaker model (e.g. "Air Jordan 1 Retro High") has universal attributes (brand, name, description, silhouette, base price), but physical inventory is tracked per size, colorway, and SKU.
- **Alternatives**:
  - *Single Flat Product Entity with Size Array*: Simple, but impossible to track individual stock quantities, size-specific pricing, or distinct SKUs per shoe size without complex unstructured JSON columns.
- **Why Selected**: Separating `Product` (parent entity) from `ProductVariant` (child entity containing `size`, `sku`, `stockQuantity`, `additionalPrice`) reflects real-world warehouse management systems (WMS) and retail databases.
- **Impact**: Enables accurate inventory reservations, per-size out-of-stock indicators, and granular restock tracking.

---

### Decision 6: React 18 with Vite and Pure CSS Design Tokens
- **Date**: 2026-09-06
- **Reason**: Fast development iteration (HMR), lightweight footprint, complete control over design aesthetics, and avoiding generic framework boilerplate.
- **Alternatives**:
  - *Next.js*: High complexity (SSR/hydration mismatch debugging), unnecessary for an app consumed as a dedicated SPA alongside a Spring Boot REST API.
  - *TailwindCSS / Bootstrap*: Can lead to generic cookie-cutter aesthetics, cluttered HTML class strings, or styling conflicts without user request.
- **Why Selected**: React with Vite provides instant build times, standard React Router v6 navigation, and custom CSS variables (`design-tokens.css`) guaranteeing a unique, luxury sneakerhead aesthetic.
- **Impact**: Highly maintainable, responsive, crisp styling without third-party CSS bloat.

---

### Decision 7: Explainable Rule-Based Recommendation Engine over Opaque ML Models
- **Date**: 2026-09-06
- **Reason**: Complex Python-based neural collaborative filtering or deep learning models require external servers, heavy dependencies, and cannot be readily explained in a 45-minute software engineering interview.
- **Alternatives**:
  - *External Python Flask ML Service*: Adds microservice complexity, network latency, and deployment headaches.
  - *Mocked / Static Recommendations*: Fails interview scrutiny.
- **Why Selected**: A weighted multi-attribute content similarity algorithm implemented in Java (matching brand affinity, category overlap, and price band proximity) is deterministic, fast, runs natively within Spring Boot, and provides clear mathematical justification when questioned by interviewers.
- **Impact**: Reliable, high-performance recommendations that are 100% explainable during technical placements.

---

### Decision 8: Persistent Documentation-Driven AI Memory System (`/project-docs/`)
- **Date**: 2026-09-06
- **Reason**: Complex projects built across different AI sessions or accounts risk severe context loss, hallucinated architecture changes, and redundant file rewrites when token windows refresh.
- **Alternatives**:
  - *Relying on chat history*: Fragile; disappears across sessions or credit changes.
  - *Single massive README*: Exceeds token limits and mixes transient tasks with permanent architecture.
- **Why Selected**: 13 focused markdown files in `/project-docs/` decouple concerns (architecture, tasks, database, continuation) and allow an incoming AI to immediately resume from ground truth with minimal token consumption.
- **Impact**: Zero context loss across AI session boundaries.
