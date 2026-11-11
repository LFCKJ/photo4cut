package com.booth.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.nio.charset.StandardCharsets;

@Slf4j
@SpringBootApplication
public class BoothAiApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(BoothAiApplication.class, args);
    }

    /**
     * .env 파일이 존재하는 경우 자동으로 읽어와 System Property에 등록 (.gitignore 안전 격리)
     */
    private static void loadDotEnv() {
        String[] possiblePaths = { ".env", "../.env", "backend/.env" };

        for (String path : possiblePaths) {
            File envFile = new File(path);
            if (envFile.exists() && envFile.isFile()) {
                log.info("Loading environment variables from: {}", envFile.getAbsolutePath());
                try (BufferedReader reader = new BufferedReader(new FileReader(envFile, StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) continue;

                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();

                            // 큰따옴표/작은따옴표 제거
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }

                            // 시스템 프로퍼티에 없는 경우에만 설정
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                } catch (Exception e) {
                    log.warn("Failed to read .env file at {}: {}", path, e.getMessage());
                }
                break; // 가장 가까운 .env 로드 후 종료
            }
        }
    }
}
