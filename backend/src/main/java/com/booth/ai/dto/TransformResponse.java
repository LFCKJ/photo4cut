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
public class TransformResponse {
    private boolean success;
    private String style;
    private List<String> transformedImages;
    private String message;
}
