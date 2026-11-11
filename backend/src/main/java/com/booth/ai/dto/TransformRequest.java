package com.booth.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransformRequest {
    /**
     * 변환할 4장의 이미지 Base64 데이터 URL 목록
     */
    private List<String> images;

    /**
     * 스타일 프리셋 ID (e.g. "comic", "retro", "watercolor", "cyberpunk", "original")
     */
    private String style;

    /**
     * 추가 프롬프트 (선택)
     */
    private String prompt;
}
