package com.booth.ai.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum StylePreset {
    GHIBLI(
        "Studio Ghibli anime style, Hayao Miyazaki aesthetic, cel shaded, soft pastel color palette, hand-drawn anime background, crisp ink lineart, masterpiece",
        "photorealistic, real human, 3d render, deformed face, bad anatomy, noisy, blurry"
    ),
    DISNEY_3D(
        "Modern Disney Pixar 3D animation style, cute character, charming expressions, big expressive eyes, ray tracing, subsurface skin scattering, smooth textures, Unreal Engine 5 render",
        "2d flat, photorealistic, deformed hands, ugly, dark, gloomy, low resolution"
    ),
    RETRO_COMIC(
        "Vintage American retro comic book illustration, pop art style, bold dark outlines, Roy Lichtenstein aesthetic, halftone screen patterns, vibrant primary colors",
        "photo, 3d render, soft gradient, airbrushed, oversaturated"
    ),
    KOREAN_WEBTOON(
        "Modern trendy Korean webtoon style, manhwa character aesthetic, sparkling eyes, detailed stylized hair, digital lineart, soft cell shading",
        "western comic, 3d render, photograph, deformed fingers, sketch lines"
    );

    private final String positivePrompt;
    private final String negativePrompt;

    public static StylePreset fromString(String styleName) {
        if (styleName == null) return GHIBLI;
        String clean = styleName.toUpperCase().replace("-", "_");
        if (clean.contains("DISNEY")) return DISNEY_3D;
        if (clean.contains("GHIBLI")) return GHIBLI;
        if (clean.contains("WEBTOON")) return KOREAN_WEBTOON;
        if (clean.contains("COMIC") || clean.contains("RETRO")) return RETRO_COMIC;

        try {
            return StylePreset.valueOf(clean);
        } catch (IllegalArgumentException e) {
            return GHIBLI;
        }
    }
}
