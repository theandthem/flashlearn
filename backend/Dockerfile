# syntax=docker/dockerfile:1

# --- Build stage: compile and package the Spring Boot jar ---
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Copy the Maven wrapper and pom first so dependency resolution is cached
# as its own layer and only re-runs when the pom changes.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw -q dependency:go-offline

# Now copy sources and build. Tests are run in CI, not in the image build.
COPY src/ src/
RUN ./mvnw -q -DskipTests package

# --- Runtime stage: slim JRE with just the jar ---
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
