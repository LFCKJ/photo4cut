package com.booth.ai.controller;

import com.booth.ai.dto.TransformRequest;
import com.booth.ai.dto.TransformResponse;
import com.booth.ai.service.AiTransformService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final AiTransformService aiTransformService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "AI Photo Booth Service",
                "version", "0.0.1"
        ));
    }

    @PostMapping("/transform")
    public ResponseEntity<TransformResponse> transform(@RequestBody TransformRequest request) {
        log.info("Received photo transformation request: style={}", request.getStyle());
        TransformResponse response = aiTransformService.transformPhotos(request);
        return ResponseEntity.ok(response);
    }
}
