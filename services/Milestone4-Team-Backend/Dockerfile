# ---- Build stage ----
# Uses Maven (with a fixed version) to compile the Spring Boot backend.
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Pre-fetch dependencies (cached layer) so subsequent builds are fast.
RUN mvn -q dependency:go-offline
COPY src ./src
# Build the runnable jar (skip tests in CI for speed; add -DskipTests if desired).
RUN mvn clean package -DskipTests

# ---- Runtime stage ----
# Slim JRE 21 image to actually run the app.
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/backend-0.1.0.jar app.jar
EXPOSE 8080
ENV PORT=8080
# Java picks up the platform's default timezone; serverTimezone is set in the JDBC URL.
ENTRYPOINT ["java", "-jar", "app.jar"]
