# Multi-stage Dockerfile for Spring Boot 3 (Java 17)
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /workspace

# Gradle 캐싱 최적화
COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
RUN chmod +x ./gradlew
RUN ./gradlew dependencies --no-daemon || true

# 소스 복사 및 빌드
COPY src ./src
RUN ./gradlew bootJar --no-daemon -x test -Dorg.gradle.jvmargs="-Xmx512m"

# 실행 환경 경량 이미지
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# 타임존 설정
ENV TZ=Asia/Seoul
RUN apk add --no-cache tzdata curl && \
    cp /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# 보안을 위한 non-root 계정
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=builder /workspace/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
