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
     * 전체 일괄 적용 스타일 프리셋 ID (선택)
     */
    private String style;

    /**
     * 각 사진(1~4번 컷)별 개별 적용 스타일 프리셋 ID 목록
     * e.g. ["ORIGINAL", "DISNEY_3D", "WATERCOLOR", "SPOTLIGHT"]
     */
    private List<String> styles;

    /**
     * 추가 프롬프트 (선택)
     */
    private String prompt;
}
