# SneakX — Environment Setup & Local Execution Guide

This document provides complete instructions for configuring and running the SneakX platform on a local development machine.

---

## 1. Prerequisites & Required Software

| Software | Minimum Version | Recommended Version | Verification Command |
| :--- | :--- | :--- | :--- |
| **Java Development Kit (JDK)** | 17 | 17 or 21 (Temurin / Oracle) | `java -version` |
| **Apache Maven** | 3.8+ | 3.9+ (or Maven Wrapper `./mvnw`) | `mvn -version` |
| **Node.js** | 18.0.0 | 20 LTS | `node -v` |
| **npm** | 9.0.0 | 10+ | `npm -v` |
| **MySQL Server** | 8.0 | 8.0.33+ | `mysql --version` |
| **Git** | 2.30+ | Latest | `git --version` |

---

## 2. Environment Variables & Secret Configuration

Never commit real credentials or secrets to version control. Configure local secrets using environment variables or a local non-committed `.env` / properties file.

### Backend Configuration Template (`application-dev.yml` / Env Vars):
```properties
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sneakx_db
DB_USERNAME=root
DB_PASSWORD=your_local_mysql_password

# JWT Security
JWT_SECRET=your_super_secret_base64_encoded_256bit_key_min_32_characters_long
JWT_EXPIRATION_MS=86400000

# Server
SERVER_PORT=8080

# Spring Mail / Real SMTP Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_16_character_app_password
MAIL_FROM=orders@sneakx.com

# Frontend Application URL (used in email CTA button "View My Orders")
FRONTEND_URL=http://localhost:5173
```

> [!IMPORTANT]
> **SMTP Security & Credential Rules:**
> 1. Never commit real credentials, passwords, or Gmail App Passwords to Git or source code. Always provide them via environment variables or a local `.env` file excluded by `.gitignore`.
> 2. **Gmail SMTP Setup:**
>    - Requires a Google Account with **2-Step Verification** enabled.
>    - Generate an **App Password**: Go to `Google Account > Security > 2-Step Verification > App passwords`.
>    - Create an App Password for "Mail" / "SneakX Backend".
>    - Set `MAIL_PASSWORD` to the 16-character generated string (e.g. `abcd efgh ijkl mnop`).
>    - **Never** use your standard Google account password.
> 3. **Safe Development Fallback:**
>    - If `MAIL_HOST` is omitted or left empty, SneakX automatically operates in **Safe Development Fallback Mode**.
>    - Order confirmation receipts are generated, fully formatted with real order details, and printed to the server console without requiring real SMTP credentials or risking order rollback.
> 4. **SendGrid / Custom SMTP:**
>    - For SendGrid: `MAIL_HOST=smtp.sendgrid.net`, `MAIL_PORT=587`, `MAIL_USERNAME=apikey`, `MAIL_PASSWORD=SG.your_api_key`.

### Frontend Configuration Template (`frontend/.env`):
```properties
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 3. Database Initialization & Profiles

### 3.1 Local Development (In-Memory H2 or Local MySQL)
- **H2 In-Memory (Zero Setup)**: Run backend with `SPRING_PROFILES_ACTIVE=h2`. Tables and seed data load automatically into memory.
- **Local MySQL**: Run local MySQL on port 3306 with `CREATE DATABASE IF NOT EXISTS sneakx_db;`.

---

## 3.2 Aiven MySQL Production Setup

To deploy SneakX against a managed Aiven MySQL 8.x cloud database:

### 1. Create Aiven MySQL Service
1. Log in to your [Aiven Console](https://console.aiven.io/).
2. Create a new service: select **MySQL** (version 8.x), cloud provider, and region.
3. Wait for the service status to become **Running**.

### 2. Obtain Connection Details
From the Aiven Service Overview page, note the following parameters:
- **Host**: e.g., `mysql-xxxx-xxxx.aivencloud.com`
- **Port**: e.g., `12345`
- **Database**: e.g., `defaultdb` (or create `sneakx_db`)
- **User**: `avnadmin`
- **Password**: `<your-aiven-service-password>`
- **Service URI**: `mysql://avnadmin:<password>@<host>:<port>/<dbname>?ssl-mode=REQUIRED`

> [!WARNING]
> Never commit actual Aiven passwords or Service URIs to version control. Set them as platform deployment secrets or environment variables.

### 3. Set Environment Variables
In your production environment (Render, Railway, Docker, or server environment):
```bash
# Database Connection (Individual variables or single DB_URL)
DB_HOST=mysql-xxxx-xxxx.aivencloud.com
DB_PORT=12345
DB_NAME=defaultdb
DB_USERNAME=avnadmin
DB_PASSWORD=your_aiven_password_here

# Alternative single JDBC URL:
# DB_URL=jdbc:mysql://mysql-xxxx-xxxx.aivencloud.com:12345/defaultdb?createDatabaseIfNotExist=true&sslMode=REQUIRED&allowPublicKeyRetrieval=true&serverTimezone=UTC

# Spring Profile
SPRING_PROFILES_ACTIVE=mysql

# Frontend Origin for CORS
FRONTEND_URL=https://your-sneakx-frontend.vercel.app

# JWT Security
JWT_SECRET=your_production_256bit_secret_key_minimum_32_characters
```

### 4. Enable Production MySQL Profile
The backend detects `SPRING_PROFILES_ACTIVE=mysql` and applies:
- SSL encrypted connection (`sslMode=REQUIRED`).
- MySQL 8 dialect (`org.hibernate.dialect.MySQLDialect`).
- Safe non-destructive schema update (`ddl-auto: update`).

### 5. Verify Database Connection & Tables
When the backend boots:
- Spring Boot establishes a TLS/SSL connection with Aiven MySQL.
- Hibernate verifies and generates all 16 relational tables (`users`, `roles`, `products`, `orders`, etc.).

### 6. Verify Seed Data
`DataInitializer` automatically and safely runs idempotently:
- Seeds 7 brands (Nike, Jordan, Adidas, Yeezy, New Balance, Converse, Puma).
- Seeds 4 categories (Basketball, Lifestyle, Running, Skateboarding).
- Seeds 37 sneaker silhouettes with full size runs, variants, and gallery images.
- Seeds demo admin (`admin@sneakx.com`) and customer (`customer@sneakx.com`) accounts.

### 7. Start Backend
```bash
java -jar target/sneakx-backend-0.0.1-SNAPSHOT.jar
```
Verify health: `GET https://your-backend-url/api/health` returns `{"status":"UP"}`.

---

## 4. Backend Startup (Spring Boot)

From the project root:
```bash
# Navigate to backend
cd backend

# Build and run using the Maven Wrapper (Windows PowerShell)
.\mvnw.cmd spring-boot:run

# Or on Unix/macOS:
./mvnw spring-boot:run
```
The backend starts at `http://localhost:8080`.  
Verify backend health via: `GET http://localhost:8080/api/health`.

---

## 5. Frontend Startup (React + Vite)

From the project root in a separate terminal:
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend starts at `http://localhost:5173`.

---

## 6. Build & Test Commands

### Backend:
```bash
# Run unit and integration tests
.\mvnw.cmd test

# Package into executable JAR (skipping tests for fast build)
.\mvnw.cmd clean package -DskipTests

# Run generated JAR
java -jar target/sneakx-backend-0.0.1-SNAPSHOT.jar
```

### Frontend:
```bash
# Run linter
npm run lint

# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 7. Common Setup Troubleshooting

### Issue: Port 8080 or 5173 is already in use
- **Cause**: Another service or previous dangling process is binding the port.
- **Solution (Windows)**:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process
  ```
- **Alternative**: Change `server.port=8081` in `application.yml` and update `VITE_API_BASE_URL` in `frontend/.env`.

### Issue: MySQL Access Denied for User 'root'
- **Cause**: Incorrect password in `application-dev.yml`.
- **Solution**: Verify credentials using MySQL CLI: `mysql -u root -p`. Ensure MySQL service is running (`Get-Service MySQL*`).

### Issue: CORS Errors in Browser Console
- **Cause**: Spring Boot backend is not allowing requests from `http://localhost:5173`.
- **Solution**: Confirm `WebSecurityConfig` or `CorsConfig` explicitly includes `http://localhost:5173` in allowed origins.
