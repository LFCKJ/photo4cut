package com.booth.ai.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum StylePreset {
    ORIGINAL(
        "Original realistic photo, high resolution, clear details, true to life colors, photographic quality",
        "blur, artifacts, lowres"
    ),
    DISNEY_3D(
        "Cute Disney Pixar 3D animated character, charming expressions, big expressive eyes, smooth 3d rendering, subsurface scattering, stylized charming 3d figurines, Unreal Engine 5 aesthetic, volumetric soft lighting, masterpiece",
        "2d flat illustration, sketch, photorealistic human skin, horrifying, deformed limbs, blurry"
    ),
    WATERCOLOR(
        "Exquisite artistic watercolor painting, elegant oil and gouache brushstrokes, impressionist art style, textured watercolor paper background, vibrant yet soft pastel color bleeds, fine art masterpiece",
        "3d render, photo, photorealistic, harsh outlines, digital vector, plastic"
    ),
    SPOTLIGHT(
        "Cinematic dramatic spotlight beam coming from above, atmospheric night scene with bright glowing moon in dark sky, moody chiaroscuro contrast, theatrical stage light beam, golden rim lighting, cinematic film still, ultra detailed",
        "flat lighting, overexposed, daytime, cartoon, anime, blurry"
    ),
    GHIBLI(
        "Studio Ghibli 1980s cel shaded anime screenshot, Hayao Miyazaki movie aesthetic, crisp ink lineart, warm nostalgic pastel color palette, hand-drawn anime background, masterpiece",
        "photorealistic, real human, 3d render, deformed face, bad anatomy, noisy, blurry"
    ),
    RETRO_COMIC(
        "Vintage American retro comic book illustration, pop art style, bold dark outlines, Roy Lichtenstein aesthetic, halftone screen patterns, vibrant primary colors",
        "photo, 3d render, soft gradient, airbrushed, oversaturated"
    ),
    CYBERPUNK(
        "Cyberpunk futuristic neon style, glowing cyan and magenta neon lights, dark moody cyberpunk city background, reflective surfaces, high tech futuristic portrait",
        "daylight, countryside, historical, traditional, washed out"
    ),
    KOREAN_WEBTOON(
        "Modern trendy Korean webtoon style, manhwa character aesthetic, sparkling eyes, detailed stylized hair, digital lineart, soft cell shading",
        "western comic, 3d render, photograph, deformed fingers, sketch lines"
    );

    private final String positivePrompt;
    private final String negativePrompt;

    public static StylePreset fromString(String styleName) {
        if (styleName == null || styleName.isBlank()) return ORIGINAL;
        String clean = styleName.toUpperCase().replace("-", "_").trim();

        if (clean.contains("ORIGINAL") || clean.contains("REAL")) return ORIGINAL;
        if (clean.contains("DISNEY") || clean.contains("3D") || clean.contains("PIXAR")) return DISNEY_3D;
        if (clean.contains("WATERCOLOR") || clean.contains("PAINT") || clean.contains("AQUARELLE")) return WATERCOLOR;
        if (clean.contains("SPOTLIGHT") || clean.contains("CINEMATIC") || clean.contains("STAGE") || clean.contains("MOON")) return SPOTLIGHT;
        if (clean.contains("GHIBLI") || clean.contains("ANIME")) return GHIBLI;
        if (clean.contains("COMIC") || clean.contains("RETRO") || clean.contains("POPART")) return RETRO_COMIC;
        if (clean.contains("CYBER") || clean.contains("NEON")) return CYBERPUNK;
        if (clean.contains("WEBTOON") || clean.contains("MANHWA")) return KOREAN_WEBTOON;

        try {
            return StylePreset.valueOf(clean);
        } catch (IllegalArgumentException e) {
            return ORIGINAL;
        }
    }
}
