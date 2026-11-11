import React, { useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useWebcam } from '../hooks/useWebcam';

// 카메라가 없거나 데스크톱 테스트용 더미 사진 생성기 (SVG Canvas -> DataURL)
function generateSamplePhotos() {
  const colors = ['#f43f5e', '#8b5cf6', '#3b82f6', '#10b981'];
  return colors.map((col, idx) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    
    // 그라데이션 배경
    const grad = ctx.createLinearGradient(0, 0, 800, 1000);
    grad.addColorStop(0, col);
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 1000);

    // 심볼 및 텍스트
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`포즈 #${idx + 1}`, 400, 480);

    ctx.font = '32px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText('AI 인생네컷 샘플 촬영', 400, 550);

    return canvas.toDataURL('image/jpeg', 0.95);
  });
}

export default function CameraView({ onPhotosCaptured }) {
  const [countdownTime, setCountdownTime] = useState(5); // 5초 간격
  const {
    webcamRef,
    cameraReady,
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
    const samples = generateSamplePhotos();
    if (onPhotosCaptured) onPhotosCaptured(samples);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Viewport Frame */}
      <div className="relative w-full max-w-2xl aspect-[4/3] bg-black rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl flex items-center justify-center">
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
          <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center z-20">
            <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
            <h4 className="text-lg font-bold text-white mb-1">카메라에 접근할 수 없습니다</h4>
            <p className="text-sm text-slate-400 mb-4 max-w-md">
              웹캠 권한을 허용해 주시거나, 웹캠이 없는 환경에서는 [테스트용 샘플 사진 4장]으로 바로 체험할 수 있습니다.
            </p>
            <button
              type="button"
              onClick={handleUseMockPhotos}
              className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
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
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[2px] z-20 pointer-events-none">
            <div className="text-9xl font-black text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] animate-pulse">
              {countdown}
            </div>
            <p className="mt-4 text-xl font-bold text-pink-300 drop-shadow">
              {currentStep}번째 컷 촬영 중! ({currentStep}/{totalSteps})
            </p>
          </div>
        )}

        {/* Current Step Badge */}
        {isCapturing && (
          <div className="absolute top-4 left-4 z-20 bg-slate-900/80 backdrop-blur border border-slate-700 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span>자동 촬영 진행 중: {currentStep} / {totalSteps}</span>
          </div>
        )}

        {/* Dev helper: Quick test button */}
        {!cameraError && !isCapturing && (
          <button
            type="button"
            onClick={handleUseMockPhotos}
            className="absolute top-4 right-4 z-20 bg-slate-900/70 hover:bg-slate-900 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 transition"
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
                className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 flex items-center justify-center ${
                  img
                    ? 'border-pink-500 bg-slate-800'
                    : isCapturing && currentStep === idx + 1
                    ? 'border-yellow-400 bg-yellow-400/10 animate-pulse'
                    : 'border-slate-700 bg-slate-900/80'
                }`}
              >
                {img ? (
                  <>
                    <img src={img} alt={`컷 ${idx + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-[11px] font-bold px-1.5 py-0.5 rounded text-white flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-pink-400" /> #{idx + 1}
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-semibold text-slate-500">#{idx + 1} 컷</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Controls */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        {!isCapturing && capturedImages.length < 4 && (
          <>
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl text-xs text-slate-300">
              <span>카운트다운:</span>
              {[3, 5, 8].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setCountdownTime(sec)}
                  className={`px-2 py-1 rounded font-bold ${
                    countdownTime === sec
                      ? 'bg-pink-500 text-white'
                      : 'bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {sec}초
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={startCaptureSequence}
              className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-pink-500/30 flex items-center gap-3 transition-transform active:scale-95"
            >
              <Camera className="w-6 h-6" />
              4컷 연속 촬영 시작
            </button>
          </>
        )}

        {isCapturing && (
          <button
            type="button"
            onClick={resetCapture}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-semibold rounded-xl flex items-center gap-2 transition"
          >
            <RefreshCw className="w-4 h-4" />
            촬영 취소
          </button>
        )}

        {capturedImages.length === 4 && (
          <button
            type="button"
            onClick={resetCapture}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-semibold rounded-xl flex items-center gap-2 transition"
          >
            <RefreshCw className="w-4 h-4" />
            다시 촬영하기
          </button>
        )}
      </div>
    </div>
  );
}
