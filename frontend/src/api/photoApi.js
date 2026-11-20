import axios from 'axios';

// Vercel 등 외부 배포 시 VITE_API_BASE_URL 환경변수 사용 (예: https://123.45.67.89.nip.io)
// 프로덕션에서 미설정 시 Vercel Rewrite 프록시 타임아웃/용량 제한을 피하기 위해 백엔드 HTTPS 주소로 직접 연결
const DEFAULT_PROD_API_URL = 'https://129.225.193.240.nip.io';
const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? DEFAULT_PROD_API_URL : '');
export const API_ORIGIN = rawBaseUrl.replace(/\/+$/, '');
const API_BASE = `${API_ORIGIN}/api/v1/photos`;

export async function checkBackendHealth() {
  try {
    const res = await axios.get(`${API_BASE}/health`, { timeout: 3000 });
    return res.data;
  } catch (error) {
    console.warn('Backend not reachable:', error.message);
    return null;
  }
}

/**
 * 4컷 사진에 대해 개별 스타일 배열(styles) 또는 단일 스타일(style)을 적용하여 변환 요청
 * @param {Array<string>} images - 4장의 Base64 Data URL 배열
 * @param {Array<string>|string} styles - 각 슬롯별 스타일 ID 배열 또는 단일 스타일 ID
 * @param {string} prompt - 추가 프롬프트 (선택)
 */
export async function transformPhotosApi(images, styles, prompt = '') {
  try {
    const payload = {
      images,
      prompt,
    };

    if (Array.isArray(styles)) {
      payload.styles = styles;
      payload.style = styles[0] || 'ORIGINAL';
    } else {
      payload.style = styles || 'ORIGINAL';
      payload.styles = [styles, styles, styles, styles];
    }

    const res = await axios.post(`${API_BASE}/transform`, payload, {
      timeout: 120000, // 120초 타임아웃 (Nano Banana 2 고해상도 4컷 생성 대기)
    });
    return res.data;
  } catch (error) {
    console.error('AI Transform API failed:', error);
    throw error;
  }
}

/**
 * 최종 합성본을 QR 코드 및 다운로드용으로 서버에 임시 저장
 */
export async function sharePhotoApi(imageDataUrl) {
  try {
    const res = await axios.post(`${API_BASE}/share`, { image: imageDataUrl });
    return res.data;
  } catch (error) {
    console.error('Share Photo API failed:', error);
    throw error;
  }
}

