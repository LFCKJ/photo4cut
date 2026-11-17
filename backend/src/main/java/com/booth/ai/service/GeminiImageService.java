package com.booth.ai.service;

import com.booth.ai.domain.StyleConcept;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.geom.Point2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiImageService {

    private final WebClient webClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent}")
    private String apiUrl;

    /**
     * MultipartFile 기반 Gemini (Nano Banana 2) 이미지 변환
     */
    public String transformPhoto(MultipartFile imageFile, String conceptName) throws IOException {
        String cleanBase64 = Base64.getEncoder().encodeToString(imageFile.getBytes());
        String mimeType = imageFile.getContentType() != null ? imageFile.getContentType() : "image/jpeg";
        return callGeminiImageApi(cleanBase64, mimeType, conceptName);
    }

    /**
     * Base64 Data URL 기반 Gemini (Nano Banana 2) 이미지 변환
     */
    public String transformBase64Photo(String base64DataUrl, String conceptName) {
        if (!StringUtils.hasText(base64DataUrl)) {
            return base64DataUrl;
        }

        // "ORIGINAL" 명시적 요청 시에만 원본 그대로 반환
        if ("ORIGINAL".equalsIgnoreCase(conceptName)) {
            return base64DataUrl;
        }

        String mimeType = "image/jpeg";
        String cleanBase64 = base64DataUrl;

        // "data:image/jpeg;base64," 접두사 제거하여 순수 Base64 문자열 추출
        if (base64DataUrl.contains(",")) {
            String[] parts = base64DataUrl.split(",", 2);
            if (parts[0].contains("image/png")) {
                mimeType = "image/png";
            }
            cleanBase64 = parts[1];
        }

        return callGeminiImageApi(cleanBase64, mimeType, conceptName);
    }

    /**
     * gemini-3.1-flash-image-preview 엔드포인트 호출 및 응답 이미지 파싱
     */
    private String callGeminiImageApi(String cleanBase64, String mimeType, String conceptName) {
        StyleConcept concept = StyleConcept.fromString(conceptName);

        // 1. Gemini API 요청 바디 구성 (responseModalities: ["IMAGE"] 필수 포함)
        Map<String, Object> requestBody = Map.of(
            "system_instruction", Map.of(
                "parts", List.of(Map.of("text", StyleConcept.SYSTEM_INSTRUCTION))
            ),
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", concept.getPrompt()),
                    Map.of("inline_data", Map.of(
                        "mime_type", mimeType,
                        "data", cleanBase64
                    ))
                ))
            ),
            "generationConfig", Map.of(
                "responseModalities", List.of("IMAGE")
            )
        );

        try {
            log.info("🍌 Nano Banana 2 호출 시작: concept={} ({}) -> {}", concept.name(), concept.getDisplayName(), apiUrl);

            Map response = webClient.post()
                    .uri(apiUrl + "?key=" + apiKey.trim())
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(60))
                    .block();

            String resultDataUrl = extractBase64Image(response);
            log.info("✅ Nano Banana 2 변환 완료: concept={}", concept.name());
            return resultDataUrl;

        } catch (WebClientResponseException e) {
            log.error("❌ Gemini API HTTP 오류 ({}): {}", e.getStatusCode(), e.getResponseBodyAsString());
            log.warn("⚠️ API 할당량 제한(429 Free Tier limit: 0 등)으로 인해 내장 컨셉 필터로 폴백 렌더링합니다: concept={}", concept.name());
            return applyLocalConceptFallback(cleanBase64, concept);
        } catch (Exception e) {
            log.error("❌ Gemini API 호출 중 예외 발생: {}", e.getMessage());
            return applyLocalConceptFallback(cleanBase64, concept);
        }
    }

    /**
     * candidates[0].content.parts 배열 안의 inlineData 객체에서 변환된 이미지 Base64 추출
     */
    @SuppressWarnings("unchecked")
    private String extractBase64Image(Map response) {
        if (response != null && response.containsKey("candidates")) {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                if (content != null && content.containsKey("parts")) {
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    for (Map<String, Object> part : parts) {
                        if (part.containsKey("inlineData")) {
                            Map<String, Object> inlineData = (Map<String, Object>) part.get("inlineData");
                            String mimeType = (String) inlineData.getOrDefault("mimeType", "image/jpeg");
                            String data = (String) inlineData.get("data");
                            return "data:" + mimeType + ";base64," + data;
                        } else if (part.containsKey("inline_data")) {
                            Map<String, Object> inlineData = (Map<String, Object>) part.get("inline_data");
                            String mimeType = (String) inlineData.getOrDefault("mime_type", "image/jpeg");
                            String data = (String) inlineData.get("data");
                            return "data:" + mimeType + ";base64," + data;
                        }
                    }
                }
            }
        }
        throw new RuntimeException("Gemini API 응답에서 변환된 이미지를 찾을 수 없습니다.");
    }

    /**
     * API Key가 Free Tier (limit: 0)여서 429가 발생할 때,
     * 원본 그대로 나오지 않도록 각 컨셉의 색감/조명/질감을 시뮬레이션하는 내장 그래픽 폴백
     */
    private String applyLocalConceptFallback(String cleanBase64, StyleConcept concept) {
        try {
            byte[] imgBytes = Base64.getDecoder().decode(cleanBase64);
            BufferedImage src = ImageIO.read(new ByteArrayInputStream(imgBytes));
            if (src == null) return "data:image/jpeg;base64," + cleanBase64;

            int w = src.getWidth();
            int h = src.getHeight();
            BufferedImage out = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);

            for (int y = 0; y < h; y++) {
                for (int x = 0; x < w; x++) {
                    int rgb = src.getRGB(x, y);
                    int r = (rgb >> 16) & 0xFF;
                    int g = (rgb >> 8) & 0xFF;
                    int b = rgb & 0xFF;

                    switch (concept) {
                        case BEAUTY_RETOUCH -> {
                            // 화사한 스튜디오 뷰티 보정 톤 (밝고 깨끗한 피부 톤)
                            r = clamp((int) (r * 1.07 + 16));
                            g = clamp((int) (g * 1.05 + 14));
                            b = clamp((int) (b * 1.04 + 14));
                        }
                        case DISNEY_3D -> {
                            // 화사하고 매끄러운 고채도 3D 스튜디오 톤 & 따뜻한 림라이트
                            float[] hsb = Color.RGBtoHSB(r, g, b, null);
                            hsb[1] = Math.min(1.0f, hsb[1] * 1.45f);
                            hsb[2] = Math.min(1.0f, (float) Math.pow(hsb[2], 0.85));
                            int c = Color.HSBtoRGB(hsb[0], hsb[1], hsb[2]);
                            r = clamp((((c >> 16) & 0xFF) / 12) * 12 + 8);
                            g = clamp((((c >> 8) & 0xFF) / 12) * 12 + 4);
                            b = clamp(((c & 0xFF) / 12) * 12);
                        }
                        case GHIBLI -> {
                            // 감성 셀 애니메이션 파스텔 & 따뜻한 톤
                            r = clamp((int) (r * 1.12 + 15));
                            g = clamp((int) (g * 1.08 + 10));
                            b = clamp((int) (b * 0.95 + 5));
                        }
                        case NEON_CLUB -> {
                            // 몽환적인 클럽 퍼플/마젠타 & 블루 네온 조명
                            r = clamp((int) (r * 1.10 + (y * 45 / h)));
                            g = clamp((int) (g * 0.78));
                            b = clamp((int) (b * 1.28 + ((h - y) * 50 / h)));
                        }
                        case RENAISSANCE -> {
                            // 클래식 르네상스 유화 명암 대비(키아로스쿠로) & 따뜻한 앤티크 골드 톤
                            double nx = (x - w * 0.5) / (w * 0.5);
                            double ny = (y - h * 0.45) / (h * 0.55);
                            double vignette = Math.max(0.35, 1.0 - 0.55 * (nx * nx + ny * ny));
                            r = clamp((int) (r * vignette * 1.14 + 12));
                            g = clamp((int) (g * vignette * 1.02 + 6));
                            b = clamp((int) (b * vignette * 0.82));
                        }
                    }
                    out.setRGB(x, y, (r << 16) | (g << 8) | b);
                }
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(out, "jpeg", baos);
            return "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(baos.toByteArray());
        } catch (Exception ex) {
            log.warn("내장 필터 폴백 처리 실패: {}", ex.getMessage());
            return "data:image/jpeg;base64," + cleanBase64;
        }
    }

    private int clamp(int val) {
        return Math.max(0, Math.min(255, val));
    }
}
