package com.booth.ai.controller;

import com.booth.ai.dto.PhotoDto;
import com.booth.ai.dto.TransformRequest;
import com.booth.ai.dto.TransformResponse;
import com.booth.ai.service.AiTransformService;
import com.booth.ai.service.PhotoStorageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
    private final PhotoStorageService photoStorageService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "AI Photo Booth Service",
                "version", "0.0.1"
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

        String scheme = request.getScheme();
        String serverName = request.getServerName();
        int serverPort = request.getServerPort();
        
        String portStr = (serverPort == 80 || serverPort == 443) ? "" : ":" + serverPort;
        String fullDownloadUrl = scheme + "://" + serverName + portStr + "/api/v1/photos/download/" + id;

        return ResponseEntity.ok(Map.of(
                "id", id,
                "downloadPath", "/api/v1/photos/download/" + id,
                "downloadUrl", fullDownloadUrl
        ));
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
