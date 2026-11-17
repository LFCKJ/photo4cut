package com.booth.ai.service;

import com.booth.ai.domain.StyleConcept;
import com.booth.ai.dto.PhotoDto;
import com.booth.ai.dto.TransformRequest;
import com.booth.ai.dto.TransformResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiTransformService {

    private final GeminiImageService geminiImageService;

    /**
     * 단일 컷 비동기 변환 (gemini-3.1-flash-image-preview 호출)
     */
    public PhotoDto.ConvertResponse transformImage(MultipartFile file, String style, int sequenceIndex) {
        long startTime = System.currentTimeMillis();
        StyleConcept concept = StyleConcept.fromString(style);

        String base64Image = null;
        try {
            byte[] fileBytes = file.getBytes();
            String contentType = file.getContentType() != null ? file.getContentType() : "image/jpeg";
            base64Image = "data:" + contentType + ";base64," + Base64.getEncoder().encodeToString(fileBytes);
        } catch (Exception e) {
            log.error("파일 바이트 읽기 실패: {}", e.getMessage());
        }

        String convertedImageUrl = geminiImageService.transformBase64Photo(base64Image, concept.name());
        if (!StringUtils.hasText(convertedImageUrl)) {
            convertedImageUrl = base64Image;
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("컷 [{}] ({}) 변환 완료: {}ms 소요", sequenceIndex, concept.name(), duration);

        return PhotoDto.ConvertResponse.builder()
                .sequenceIndex(sequenceIndex)
                .originalUrl(base64Image)
                .convertedUrl(convertedImageUrl)
                .processTimeMs(duration)
                .provider("gemini-3.1-flash-image-preview")
                .build();
    }

    /**
     * 4컷 각 사진별 맞춤 컨셉/스타일 변환 처리 (병렬 처리로 4장 총 소요 시간 ~15초 단축)
     */
    public TransformResponse transformPhotos(TransformRequest request) {
        List<String> rawImages = request.getImages();
        if (rawImages == null || rawImages.isEmpty()) {
            return TransformResponse.builder().success(false).message("변환할 이미지가 없습니다.").build();
        }

        List<String> styles = request.getStyles();
        String defaultStyle = StringUtils.hasText(request.getStyle()) ? request.getStyle() : "BEAUTY_RETOUCH";

        List<StyleConcept> slotConcepts = new ArrayList<>();
        for (int i = 0; i < rawImages.size(); i++) {
            if (styles != null && i < styles.size() && StringUtils.hasText(styles.get(i))) {
                slotConcepts.add(StyleConcept.fromString(styles.get(i)));
            } else {
                slotConcepts.add(StyleConcept.fromString(defaultStyle));
            }
        }

        log.info("🍌 4컷 개별 스타일 병렬 변환 시작 (gemini-3.1-flash-image-preview): {}",
                slotConcepts.stream().map(StyleConcept::name).collect(Collectors.joining(", ")));

        List<CompletableFuture<String>> futures = new ArrayList<>();

        for (int i = 0; i < rawImages.size(); i++) {
            final int index = i;
            final String rawImage = rawImages.get(i);
            final StyleConcept concept = slotConcepts.get(i);

            CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
                try {
                    // 동시 순간 폭주 방지를 위한 300ms 시차 병렬 출발
                    if (index > 0) {
                        Thread.sleep(index * 300L);
                    }
                    String styled = geminiImageService.transformBase64Photo(rawImage, concept.name());
                    return StringUtils.hasText(styled) ? styled : rawImage;
                } catch (Exception e) {
                    log.error("컷 #{} ({}) 변환 중 오류: {}", index + 1, concept, e.getMessage());
                    return rawImage;
                }
            });
            futures.add(future);
        }

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        List<String> resultImages = futures.stream()
                .map(CompletableFuture::join)
                .collect(Collectors.toList());

        List<String> appliedStyleNames = slotConcepts.stream()
                .map(StyleConcept::name)
                .collect(Collectors.toList());

        return TransformResponse.builder()
                .success(true)
                .style(defaultStyle)
                .styles(appliedStyleNames)
                .transformedImages(resultImages)
                .message("Nano Banana 2 4컷 맞춤 스타일 변환이 완료되었습니다.")
                .build();
    }
}
