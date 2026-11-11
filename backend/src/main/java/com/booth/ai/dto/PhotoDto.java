package com.booth.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

public class PhotoDto {

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConvertRequest {
        private MultipartFile file;
        private String style;
        private int sequenceIndex; // 1 ~ 4
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConvertResponse {
        private int sequenceIndex;
        private String originalUrl;
        private String convertedUrl;
        private long processTimeMs;
        private String provider;
    }
}
