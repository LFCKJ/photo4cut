package com.booth.ai.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum StyleConcept {

    BEAUTY_RETOUCH(
        "AI 뷰티 보정",
        "Enhance this portrait into a high-end Korean studio beauty photograph. Apply natural, luminous skin retouching, bright soft studio key lighting, subtle rosy cheeks, and crisp eye clarity while keeping the person's exact facial identity, hairstyle, outfit, and hand gesture completely authentic and photorealistic. Do not turn it into an illustration."
    ),
    GHIBLI(
        "지브리 애니메이션",
        "Transform this photo into a classic Studio Ghibli hand-drawn 2D cel animation style. Lush painted gouache background, clean expressive anime line art, soft warm lighting, nostalgic anime movie aesthetic, preserving the exact likeness, hairstyle, outfit, and poses of the subject."
    ),
    DISNEY_3D(
        "디즈니 3D 캐릭터",
        "Transform the person in this photo into a modern Disney Pixar 3D animated movie character. Expressive large eyes, smooth subsurface scattering skin texture, soft stylized 3D hair strands, cinematic rim lighting, and vibrant depth of field, while strictly preserving the exact hairstyle, outfit details, facial expression, and hand pose from the original photo."
    ),
    NEON_CLUB(
        "네온 클럽 무드",
        "Transform the lighting and atmosphere of this photo into a dreamy late-night neon club aesthetic. Keep the person completely photorealistic, bathed in vibrant purple, magenta, and electric blue neon rim lights, with blurred colorful city bokeh lights in the dark background, preserving the exact face, expression, outfit, and pose."
    ),
    RENAISSANCE_OIL(
        "르네상스 명화",
        "Transform this portrait into a classic Renaissance oil painting masterpiece. Rich visible oil brushstrokes on canvas, warm golden chiaroscuro lighting, deep dramatic shadows, vintage classical drapery and aristocratic attire blended naturally with the subject's exact facial features, expression, and pose."
    ),
    RETRO_FILM(
        "Y2K 레트로 필름",
        "Transform this photo into a nostalgic 1990s vintage analog film photograph. Warm Kodak Portra color grading, subtle natural film grain, soft dreamy lens halation, candid retro flash aesthetic, keeping the person's exact face, outfit, and pose completely faithful to the original."
    );

    private final String displayName;
    private final String prompt;

    /**
     * 공통 시스템 지시사항 (원본 인물의 얼굴, 포즈, 의상, 배경 구도 고정 규칙)
     */
    public static final String SYSTEM_INSTRUCTION =
        "You are an expert photo-to-art style transfer AI. " +
        "Transform the provided input image into the requested artistic style while STRICTLY preserving: " +
        "1. The exact facial features, expressions, hairstyles, and identities of all people in the photo. " +
        "2. Their exact poses, hand gestures (such as peace signs or finger hearts), body positions, and clothing details (logos, numbers, colors). " +
        "3. The overall framing and composition. " +
        "Do not add or remove people or major objects. " +
        "Do NOT add any borders, Polaroid frames, film frames, text, dates, watermarks, or captions around or inside the image. " +
        "Fill the entire image edge-to-edge and only change the rendering medium, lighting, texture, and artistic style.";

    public static StyleConcept fromString(String conceptName) {
        if (conceptName == null || conceptName.isBlank()) {
            return BEAUTY_RETOUCH;
        }
        String clean = conceptName.trim().toUpperCase().replace("-", "_");

        if (clean.contains("BEAUTY") || clean.contains("RETOUCH") || clean.contains("IDOL") || clean.contains("ORIGINAL") || clean.contains("REAL")) {
            return BEAUTY_RETOUCH;
        }
        if (clean.contains("GHIBLI") || clean.contains("ANIME")) {
            return GHIBLI;
        }
        if (clean.contains("DISNEY") || clean.contains("PIXAR") || clean.contains("3D") || clean.contains("CLAY")) {
            return DISNEY_3D;
        }
        if (clean.contains("NEON") || clean.contains("CLUB") || clean.contains("CITY") || clean.contains("POP") || clean.contains("CYBER")) {
            return NEON_CLUB;
        }
        if (clean.contains("RENAISSANCE") || clean.contains("OIL") || clean.contains("CLASSIC") || clean.contains("WATERCOLOR") || clean.contains("CINEMATIC")) {
            return RENAISSANCE_OIL;
        }
        if (clean.contains("RETRO") || clean.contains("FILM") || clean.contains("Y2K") || clean.contains("POLAROID")) {
            return RETRO_FILM;
        }

        try {
            return StyleConcept.valueOf(clean);
        } catch (IllegalArgumentException e) {
            return BEAUTY_RETOUCH;
        }
    }
}
