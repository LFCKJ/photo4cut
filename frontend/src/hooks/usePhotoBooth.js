import { useState, useCallback } from 'react';
import axios from 'axios';

/**
 * [ai (1).md 명세 5절] 촬영 즉시 백그라운드 변환 훅 (Instant Background Conversion)
 */
export function usePhotoBooth(selectedStyle = 'ghibli') {
  // photos: Array<{ index, original, converted, status: 'PENDING' | 'CONVERTING' | 'DONE' | 'FAILED' }>
  const [photoItems, setPhotoItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 이미지 리사이징 헬퍼 (ai (1).md 6.2 권장: 1024px 축소로 전송 및 AI 생성 속도 2배 향상)
  const resizeImage = (dataUrl, maxWidth = 1024) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width <= maxWidth) {
          resolve(dataUrl);
          return;
        }
        const scale = maxWidth / img.width;
        const canvas = document.createElement('canvas');
        canvas.width = maxWidth;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.src = dataUrl;
    });
  };

  /**
   * 1컷 캡처 즉시 호출되는 백그라운드 전송 함수
   */
  const captureAndConvert = useCallback(
    async (imageBase64, stepIndex) => {
      if (!imageBase64) return;

      // 1. 프리뷰 상태 등록 (즉시 화면 표시)
      const newItem = {
        index: stepIndex,
        original: imageBase64,
        converted: null,
        status: 'CONVERTING',
      };

      setPhotoItems((prev) => {
        const filtered = prev.filter((p) => p.index !== stepIndex);
        return [...filtered, newItem].sort((a, b) => a.index - b.index);
      });

      try {
        setIsProcessing(true);

        // 이미지 최적화 리사이징
        const optimizedDataUrl = await resizeImage(imageBase64, 1024);
        const resBlob = await (await fetch(optimizedDataUrl)).blob();

        const formData = new FormData();
        formData.append('file', resBlob, `cut_${stepIndex}.jpg`);
        formData.append('style', selectedStyle);
        formData.append('sequenceIndex', stepIndex.toString());

        // 2. 비동기 논블로킹 백그라운드 API 전송 (다음 카운트다운을 막지 않음)
        const response = await axios.post('/api/v1/photos/convert', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 20000,
        });

        const convertedUrl = response.data.convertedUrl;

        setPhotoItems((prev) =>
          prev.map((item) =>
            item.index === stepIndex
              ? { ...item, converted: convertedUrl || item.original, status: 'DONE' }
              : item
          )
        );
      } catch (err) {
        console.warn(`컷 #${stepIndex} 변환 실패 또는 타임아웃, 원본으로 폴백:`, err);
        setPhotoItems((prev) =>
          prev.map((item) =>
            item.index === stepIndex ? { ...item, converted: item.original, status: 'FAILED' } : item
          )
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedStyle]
  );

  const resetBooth = useCallback(() => {
    setPhotoItems([]);
    setIsProcessing(false);
  }, []);

  return {
    photoItems,
    captureAndConvert,
    isProcessing,
    resetBooth,
  };
}
