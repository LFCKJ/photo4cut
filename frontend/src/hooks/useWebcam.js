import { useState, useRef, useCallback, useEffect } from 'react';

export function useWebcam({
  captureCount = 4,
  countdownSeconds = 5,
  targetAspectRatio = null,
  onComplete,
} = {}) {
  const webcamRef = useRef(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 1 ~ captureCount
  const [countdown, setCountdown] = useState(countdownSeconds);
  const [isFlashing, setIsFlashing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const timerRef = useRef(null);

  // 단일 컷 캡처 함수 (프레임 슬롯 비율에 맞춰 중앙 크롭)
  const capturePhoto = useCallback(() => {
    if (!webcamRef.current) return null;
    const video = webcamRef.current.video;

    if (video && video.videoWidth > 0 && video.videoHeight > 0 && targetAspectRatio) {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const videoRatio = vw / vh;

      let sx = 0;
      let sy = 0;
      let sw = vw;
      let sh = vh;

      if (videoRatio > targetAspectRatio) {
        sw = vh * targetAspectRatio;
        sx = (vw - sw) / 2;
      } else {
        sh = vw / targetAspectRatio;
        sy = (vh - sh) / 2;
      }

      const maxDim = 1200;
      const outW = targetAspectRatio >= 1 ? maxDim : Math.round(maxDim * targetAspectRatio);
      const outH = targetAspectRatio >= 1 ? Math.round(maxDim / targetAspectRatio) : maxDim;

      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      // mirrored=true 상태와 동일하게 좌우 반전
      ctx.translate(outW, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, outW, outH);
      return canvas.toDataURL('image/jpeg', 0.95);
    }

    return webcamRef.current.getScreenshot({ width: 1280, height: 960 });
  }, [targetAspectRatio]);

  // 플래시 애니메이션 효과
  const triggerFlash = useCallback(() => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);
  }, []);

  // 캡처 시퀀스 시작
  const startCaptureSequence = useCallback(() => {
    setCapturedImages([]);
    setCurrentStep(1);
    setCountdown(countdownSeconds);
    setIsCapturing(true);
  }, [countdownSeconds]);

  // 카운트다운 및 다회차 캡처 루프 제어
  useEffect(() => {
    if (!isCapturing) return;

    if (countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timerRef.current);
    }

    if (countdown === 0) {
      triggerFlash();
      const photo = capturePhoto();

      if (photo) {
        setCapturedImages((prev) => {
          const next = [...prev, photo];
          if (next.length >= captureCount) {
            setIsCapturing(false);
            if (onComplete) onComplete(next);
          } else {
            setCurrentStep(next.length + 1);
            setCountdown(countdownSeconds);
          }
          return next;
        });
      }
    }
  }, [isCapturing, countdown, captureCount, countdownSeconds, capturePhoto, triggerFlash, onComplete]);

  // 재촬영 / 리셋
  const resetCapture = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsCapturing(false);
    setCapturedImages([]);
    setCurrentStep(0);
    setCountdown(countdownSeconds);
  }, [countdownSeconds]);

  return {
    webcamRef,
    cameraReady,
    setCameraReady,
    cameraError,
    setCameraError,
    capturedImages,
    isCapturing,
    currentStep,
    totalSteps: captureCount,
    countdown,
    isFlashing,
    startCaptureSequence,
    resetCapture,
  };
}
