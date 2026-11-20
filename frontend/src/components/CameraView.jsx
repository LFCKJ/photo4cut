import React, { useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useWebcam } from '../hooks/useWebcam';

// 카메라가 없거나 테스트용 샘플 사진 4장 생성기 (선택된 프레임 슬롯 비율에 맞춤)
function generateSamplePhotos(slotAspect = 2 / 3) {
  const colors = ['#e11d48', '#7c3aed', '#0284c7', '#059669'];
  const baseDim = 1000;
  const width = slotAspect >= 1 ? baseDim : Math.round(baseDim * slotAspect);
  const height = slotAspect >= 1 ? Math.round(baseDim / slotAspect) : baseDim;

  return colors.map((col, idx) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, col);
    grad.addColorStop(1, '#1c1917');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(Math.min(width, height) * 0.09)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`포즈 #${idx + 1}`, width / 2, height * 0.48);

    ctx.font = `${Math.round(Math.min(width, height) * 0.04)}px sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText('ATELIER 4CUT SAMPLE', width / 2, height * 0.56);

    return canvas.toDataURL('image/jpeg', 0.95);
  });
}

export default function CameraView({ frame, onPhotosCaptured }) {
  const [countdownTime, setCountdownTime] = useState(5);
  const firstSlot = frame?.slots?.[0];
  const slotAspect = firstSlot ? firstSlot.width / firstSlot.height : 2 / 3;
  const isPortraitSlot = slotAspect < 1;

  const {
    webcamRef,
    setCameraReady,
    cameraError,
    setCameraError,
    capturedImages,
    isCapturing,
    currentStep,
    totalSteps,
    countdown,
    isFlashing,
    startCaptureSequence,
    resetCapture,
  } = useWebcam({
    captureCount: 4,
    countdownSeconds: countdownTime,
    targetAspectRatio: slotAspect,
    onComplete: (photos) => {
      if (onPhotosCaptured) onPhotosCaptured(photos);
    },
  });

  const videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 960 },
    facingMode: 'user',
  };

  const handleUseMockPhotos = () => {
    const samples = generateSamplePhotos(slotAspect);
    if (onPhotosCaptured) onPhotosCaptured(samples);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Viewport Frame (선택된 프레임 슬롯 비율과 일치) */}
      <div
        style={{ aspectRatio: slotAspect }}
        className={`relative w-full ${
          isPortraitSlot ? 'max-w-sm' : 'max-w-xl'
        } bg-stone-950 rounded-2xl overflow-hidden border border-stone-300 shadow-[0_16px_40px_-12px_rgba(28,25,23,0.18)] flex items-center justify-center`}
      >
        {/* Subtle Studio Viewfinder Corner Guides */}
        <div className="pointer-events-none absolute inset-4 z-10">
          <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/40 rounded-tl-sm" />
          <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/40 rounded-tr-sm" />
          <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/40 rounded-bl-sm" />
          <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/40 rounded-br-sm" />
        </div>

        {/* Webcam Component */}
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          mirrored={true}
          onUserMedia={() => {
            setCameraReady(true);
            setCameraError(null);
          }}
          onUserMediaError={(err) => {
            console.error('Camera Error:', err);
            setCameraError(err.message || '카메라를 사용할 수 없습니다.');
          }}
          className="w-full h-full object-cover"
        />

        {/* Camera Error / No Device Fallback */}
        {cameraError && (
          <div className="absolute inset-0 bg-[#FAF8F5]/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-rose-600" />
            </div>
            <h4 className="text-lg font-bold text-stone-900 mb-1">카메라에 접근할 수 없습니다</h4>
            <p className="text-xs sm:text-sm text-stone-500 mb-5 max-w-md leading-relaxed">
              웹캠 권한을 허용해 주시거나, 카메라가 없는 환경에서는 테스트용 샘플 사진 4장으로 바로 체험할 수 있습니다.
            </p>
            <button
              type="button"
              onClick={handleUseMockPhotos}
              className="px-5 py-3 bg-stone-900 hover:bg-stone-800 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-rose-400" />
              테스트용 샘플 사진 4장으로 진행
            </button>
          </div>
        )}

        {/* Flash Effect */}
        <div
          className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-150 z-30 ${
            isFlashing ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Countdown Overlay */}
        {isCapturing && countdown > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950/35 backdrop-blur-[2px] z-20 pointer-events-none">
            <div className="text-8xl sm:text-9xl font-black text-white drop-shadow-[0_10px_25px_rgba(0,0,0,0.65)] animate-pulse tabular-nums">
              {countdown}
            </div>
            <p className="mt-4 px-4 py-1.5 rounded-full bg-white/90 text-stone-900 text-xs sm:text-sm font-bold shadow">
              {currentStep}번째 컷 촬영 중 ({currentStep}/{totalSteps})
            </p>
          </div>
        )}

        {/* Current Step Badge */}
        {isCapturing && (
          <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur border border-stone-200 px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold text-stone-900 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>
              촬영 진행 중 {currentStep} / {totalSteps}
            </span>
          </div>
        )}

        {/* Dev helper: Quick test button */}
        {!cameraError && !isCapturing && (
          <button
            type="button"
            onClick={handleUseMockPhotos}
            className="absolute top-4 right-4 z-20 bg-white/85 hover:bg-white text-xs font-semibold text-stone-700 hover:text-stone-900 px-3 py-1.5 rounded-full border border-stone-200/80 shadow-sm backdrop-blur transition"
          >
            샘플 사진으로 테스트
          </button>
        )}
      </div>

      {/* Captured Thumbnails Bar */}
      <div className="w-full max-w-2xl mt-4">
        <div className="grid grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((idx) => {
            const img = capturedImages[idx];
            return (
              <div
                key={idx}
                style={{ aspectRatio: slotAspect }}
                className={`relative rounded-xl overflow-hidden border transition-all flex items-center justify-center ${
                  img
                    ? 'border-stone-900 bg-stone-100 shadow-sm'
                    : isCapturing && currentStep === idx + 1
                    ? 'border-rose-500 bg-rose-50 animate-pulse'
                    : 'border-stone-200 bg-[#FAF8F5]'
                }`}
              >
                {img ? (
                  <>
                    <img src={img} alt={`컷 ${idx + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 right-1.5 bg-white/90 text-[10px] font-bold px-1.5 py-0.5 rounded-md text-stone-900 flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3 h-3 text-rose-500" /> #{idx + 1}
                    </span>
                  </>
                ) : (
                  <span className="text-[11px] font-semibold text-stone-400">
                    CUT 0{idx + 1}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Controls */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3.5">
        {!isCapturing && capturedImages.length < 4 && (
          <>
            <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-stone-200 px-3 py-2 rounded-xl text-xs text-stone-600">
              <span className="font-semibold mr-1">타이머</span>
              {[3, 5, 8].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setCountdownTime(sec)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    countdownTime === sec
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'bg-white text-stone-500 hover:text-stone-900 border border-stone-200/70'
                  }`}
                >
                  {sec}초
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={startCaptureSequence}
              className="px-8 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-stone-900/15 flex items-center gap-2.5 transition active:scale-[0.98]"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <Camera className="w-5 h-5" />
              <span>4컷 연속 촬영 시작</span>
            </button>
          </>
        )}

        {isCapturing && (
          <button
            type="button"
            onClick={resetCapture}
            className="px-6 py-2.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 font-semibold text-sm rounded-xl flex items-center gap-2 transition shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            촬영 취소
          </button>
        )}

        {capturedImages.length === 4 && (
          <button
            type="button"
            onClick={resetCapture}
            className="px-6 py-2.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 font-semibold text-sm rounded-xl flex items-center gap-2 transition shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            다시 촬영하기
          </button>
        )}
      </div>
    </div>
  );
}
