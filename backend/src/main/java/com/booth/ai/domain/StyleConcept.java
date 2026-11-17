package com.booth.ai.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum StyleConcept {

    // 1. AI 보정 미인·미남상 (피부 보정, 조명, 윤곽 보정)
    BEAUTY_RETOUCH(
        "AI 뷰티 보정",
        "Apply high-end Korean studio beauty retouching to this portrait photo. Smooth and brighten the skin naturally, remove minor blemishes, gently enhance facial proportions and eye brightness, and add soft flattering studio key lighting with a clean healthy glow. Create a polished, naturally attractive idol-like portrait while strictly preserving each person's real identity, expression, hairstyle, pose, and outfit."
    ),

    // 2. 지브리 / 감성 셀 애니메이션
    GHIBLI(
        "지브리 애니메이션",
        "Transform this photo into a classic 1990s Japanese hand-drawn cel animation style. Lush painted gouache background, clean anime line art, expressive anime eyes, soft warm lighting, nostalgic anime movie screenshot aesthetic, preserving the exact likeness, hairstyles, outfits, and poses of all subjects."
    ),

    // 3. 픽사 / 디즈니 3D 애니메이션
    DISNEY_3D(
        "디즈니 3D 캐릭터",
        "Transform the people and scene into a modern 3D animated feature film style. Expressive stylized 3D characters, smooth subsurface skin scattering, detailed fabric textures on their outfits, cinematic rim lighting, keeping everyone's exact facial identity, outfits, and poses."
    ),

    // 4. 네온 클럽 분위기 (퍼플·마젠타·블루 네온 조명)
    NEON_CLUB(
        "네온 클럽 무드",
        "Transform this photo into a dreamy, vibrant nightclub neon portrait. Illuminate the subjects and dark night background with glowing purple, magenta, and electric cyan-blue neon lights, colorful rim lighting along hair and shoulders, and soft atmospheric neon bokeh reflections, while strictly preserving every person's exact facial features, expression, pose, and outfit."
    ),

    // 5. 르네상스 명화 스타일 (클래식 유화 초상화)
    RENAISSANCE(
        "르네상스 명화",
        "Transform this photo into a classical Renaissance oil painting portrait masterpiece. Rich warm chiaroscuro lighting, soft directional museum light against a deep dark warm umber background, visible fine oil brushstrokes on canvas, timeless classical European portrait aesthetic with subtle antique golden warmth and draped classical fabric elegance, while preserving each person's exact facial likeness, expression, and pose."
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
        "Do not add or remove people or major objects. Only change the rendering medium, lighting, texture, and artistic style.";

    public static StyleConcept fromString(String conceptName) {
        if (conceptName == null || conceptName.isBlank()) {
            return BEAUTY_RETOUCH;
        }
        String clean = conceptName.trim().toUpperCase().replace("-", "_");

        if (clean.contains("BEAUTY") || clean.contains("RETOUCH") || clean.contains("IDOL") || clean.contains("POLAROID") || clean.contains("ORIGINAL") || clean.contains("REAL")) {
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
            return RENAISSANCE;
        }

        try {
            return StyleConcept.valueOf(clean);
        } catch (IllegalArgumentException e) {
            return BEAUTY_RETOUCH;
        }
    }
}
