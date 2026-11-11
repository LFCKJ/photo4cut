import { useState, useRef, useCallback, useEffect } from 'react';

export function useWebcam({ captureCount = 4, countdownSeconds = 5, onComplete } = {}) {
  const webcamRef = useRef(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 1 ~ captureCount
  const [countdown, setCountdown] = useState(countdownSeconds);
  const [isFlashing, setIsFlashing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const timerRef = useRef(null);

  // 단일 컷 캡처 함수
  const capturePhoto = useCallback(() => {
    if (!webcamRef.current) return null;
    const imageSrc = webcamRef.current.getScreenshot({ width: 1280, height: 960 });
    return imageSrc;
  }, []);

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
      // 셔터 찰칵!
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
