# ==============================================================================
# SNEAKX BACKEND DOCKERFILE (MULTI-STAGE BUILD)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build & Package the Application
# ------------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and resolve dependencies for efficient layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build the executable JAR (skip unit/integration tests during image build)
COPY src ./src
RUN mvn clean package -DskipTests -B

# ------------------------------------------------------------------------------
# Stage 2: Production Runtime Environment
# ------------------------------------------------------------------------------
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Create a non-root user for container security
RUN groupadd -r sneakx && useradd -r -g sneakx sneakx

# Copy the compiled JAR artifact from the build stage
COPY --from=build /app/target/sneakx-backend-0.0.1-SNAPSHOT.jar app.jar

# Set correct permissions and switch to non-root user
RUN chown sneakx:sneakx app.jar
USER sneakx

# Expose default HTTP port (overridable at runtime via PORT environment variable)
EXPOSE 8080

# Run Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
