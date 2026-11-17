package com.booth.ai.controller;

import com.booth.ai.dto.PhotoDto;
import com.booth.ai.dto.TransformRequest;
import com.booth.ai.dto.TransformResponse;
import com.booth.ai.service.AiTransformService;
import com.booth.ai.service.PhotoStorageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final AiTransformService aiTransformService;
    private final com.booth.ai.service.GeminiImageService geminiImageService;
    private final PhotoStorageService photoStorageService;

    @Value("${app.public-base-url:}")
    private String publicBaseUrl;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "AI Photo Booth Service",
                "version", "0.0.1"
        ));
    }

    /**
     * [enum_gemini_api.md] Gemini 기반 단일 컷 직접 변환 엔드포인트
     */
    @PostMapping(value = "/gemini-transform", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> transformWithGeminiDirect(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "concept", defaultValue = "BEAUTY_RETOUCH") String concept
    ) throws IOException {
        log.info("Gemini 직접 변환 요청: concept='{}'", concept);
        String resultImageUrl = geminiImageService.transformPhoto(file, concept);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "concept", concept,
                "imageUrl", resultImageUrl
        ));
    }

    /**
     * [ai (1).md 핵심] 촬영 즉시 1컷 비동기 변환 엔드포인트
     */
    @PostMapping(value = "/convert", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PhotoDto.ConvertResponse> convertSinglePhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam("style") String style,
            @RequestParam(value = "sequenceIndex", defaultValue = "1") int sequenceIndex
    ) throws IOException {
        log.info("Received instant conversion request: cut #{} with style '{}'", sequenceIndex, style);
        PhotoDto.ConvertResponse response = aiTransformService.transformImage(file, style, sequenceIndex);
        return ResponseEntity.ok(response);
    }

    /**
     * 일괄 4장 변환 엔드포인트 (기존 호환)
     */
    @PostMapping("/transform")
    public ResponseEntity<TransformResponse> transform(@RequestBody TransformRequest request) {
        log.info("Received photo transformation request: style={}", request.getStyle());
        TransformResponse response = aiTransformService.transformPhotos(request);
        return ResponseEntity.ok(response);
    }

    /**
     * 최종 합성본 이미지를 공유 및 다운로드할 수 있도록 임시 저장
     */
    @PostMapping("/share")
    public ResponseEntity<Map<String, String>> sharePhoto(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String image = body.get("image");
        if (image == null || image.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Image data is required"));
        }

        String id = photoStorageService.storePhoto(image);

        String fullDownloadUrl;
        if (StringUtils.hasText(publicBaseUrl)) {
            String base = publicBaseUrl.replaceAll("/+$", "");
            fullDownloadUrl = base + "/api/v1/photos/download/" + id;
        } else {
            String scheme = request.getHeader("X-Forwarded-Proto");
            if (!StringUtils.hasText(scheme)) {
                scheme = request.getScheme();
            }

            String host = request.getHeader("X-Forwarded-Host");
            if (!StringUtils.hasText(host)) {
                host = request.getServerName();
                int serverPort = request.getServerPort();
                if (serverPort != 80 && serverPort != 443 && serverPort > 0) {
                    host = host + ":" + serverPort;
                }
            }
            fullDownloadUrl = scheme + "://" + host + "/api/v1/photos/download/" + id;
        }

        return ResponseEntity.ok(Map.of(
                "id", id,
                "downloadPath", "/api/v1/photos/download/" + id,
                "viewPath", "/api/v1/photos/view/" + id,
                "downloadUrl", fullDownloadUrl
        ));
    }

    /**
     * 모바일(iOS/Android) QR 스캔 시 사진 앱 저장이 쉬운 뷰어 페이지 제공
     */
    @GetMapping(value = "/view/{id}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> viewPhotoPage(@PathVariable String id) {
        byte[] imageBytes = photoStorageService.getPhoto(id);
        if (imageBytes == null) {
            return ResponseEntity.status(404).body("<html><body style='background:#0f172a;color:#fff;font-family:sans-serif;text-align:center;padding:40px;'><h2>사진을 찾을 수 없습니다.</h2><p>만료되었거나 잘못된 링크입니다.</p></body></html>");
        }

        String safeId = id.replaceAll("[^a-zA-Z0-9_-]", "");
        String html = """
                <!DOCTYPE html>
                <html lang="ko">
                <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
                  <title>AI 인생네컷 사진 저장</title>
                  <style>
                    body { margin: 0; background: #090d16; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif; display: flex; flex-direction: column; align-items: center; padding: 24px 16px 40px; }
                    .badge { background: rgba(236,72,153,0.18); color: #f472b6; border: 1px solid rgba(236,72,153,0.4); padding: 5px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; margin-bottom: 10px; }
                    h1 { font-size: 20px; margin: 0 0 6px; }
                    .tip { font-size: 13px; color: #cbd5e1; text-align: center; line-height: 1.5; margin-bottom: 18px; max-width: 360px; }
                    .tip b { color: #a3e635; }
                    .card { width: 100%; max-width: 360px; background: #111827; border: 1px solid #1e293b; border-radius: 18px; padding: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
                    .card img { width: 100%; height: auto; border-radius: 10px; display: block; -webkit-touch-callout: default; }
                    .actions { width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }
                    .btn-primary { width: 100%; padding: 14px; border: none; border-radius: 14px; background: linear-gradient(90deg, #ec4899, #8b5cf6); color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; }
                    .btn-secondary { display: block; text-align: center; padding: 12px; border-radius: 14px; background: #1e293b; color: #e2e8f0; text-decoration: none; font-size: 13px; font-weight: 700; border: 1px solid #334155; }
                  </style>
                </head>
                <body>
                  <div class="badge">AI 인생네컷 포토부스</div>
                  <h1>내 인생네컷 저장하기</h1>
                  <p class="tip">
                    <b>iPhone(iOS)</b>: 아래 사진을 <b>길게 꾹 눌러 "사진에 저장"</b>을 누르거나,<br/>
                    아래 <b>[사진첩에 저장하기]</b> 버튼을 눌러 <b>"이미지 저장"</b>을 선택하세요!
                  </p>
                  <div class="card">
                    <img id="photoImg" src="/api/v1/photos/image/__ID__" alt="AI 인생네컷" />
                  </div>
                  <div class="actions">
                    <button id="shareBtn" class="btn-primary" type="button">사진첩에 저장하기 (공유)</button>
                    <a class="btn-secondary" href="/api/v1/photos/download/__ID__" download="ai-photo4cut-__ID__.png">파일로 직접 다운로드</a>
                  </div>
                  <script>
                    const shareBtn = document.getElementById('shareBtn');
                    shareBtn.addEventListener('click', async () => {
                      try {
                        const res = await fetch('/api/v1/photos/image/__ID__');
                        const blob = await res.blob();
                        const file = new File([blob], 'ai-photo4cut-__ID__.png', { type: 'image/png' });
                        if (navigator.canShare && navigator.canShare({ files: [file] })) {
                          await navigator.share({ files: [file], title: 'AI 인생네컷' });
                          return;
                        }
                      } catch (e) {}
                      alert('위 사진을 길게 꾹 눌러 "사진에 저장"을 선택하거나 아래 파일 다운로드를 이용해 주세요.');
                    });
                  </script>
                </body>
                </html>
                """.replace("__ID__", safeId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/html; charset=UTF-8"))
                .body(html);
    }

    /**
     * 브라우저 인라인 표시용 이미지 스트리밍 (iOS 사진 길게 눌러 저장 지원)
     */
    @GetMapping("/image/{id}")
    public ResponseEntity<byte[]> viewPhotoInline(@PathVariable String id) {
        byte[] imageBytes = photoStorageService.getPhoto(id);
        if (imageBytes == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"ai-photo4cut-" + id + ".png\"")
                .body(imageBytes);
    }

    /**
     * QR 코드 스캔 또는 직접 다운로드 요청 시 PNG 파일 바이너리 스트리밍
     */
    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadPhoto(@PathVariable String id) {
        byte[] imageBytes = photoStorageService.getPhoto(id);
        if (imageBytes == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"ai-photo4cut-" + id + ".png\"")
                .body(imageBytes);
    }
}
