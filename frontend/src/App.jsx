import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Camera, Sparkles, RefreshCw, ChevronRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { PHOTO_FRAMES } from './constants/frames';
import FrameSelector from './components/FrameSelector';
import CameraView from './components/CameraView';
import PhotoStrip from './components/PhotoStrip';
import QrModal from './components/QrModal';
import PrintModal from './components/PrintModal';

const STEPS = [
  { id: 1, name: '프레임 선택' },
  { id: 2, name: '4컷 사진 촬영' },
  { id: 3, name: '인생네컷 완성' },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFrame, setSelectedFrame] = useState(PHOTO_FRAMES[0]);

  // 촬영된 4장의 실제 사진
  const [photos, setPhotos] = useState([]);

  // 최종 렌더링된 4컷 합성 DataURL
  const [finalDataUrl, setFinalDataUrl] = useState(null);

  // 모달 제어 (QR 다운로드, 프린터 인쇄)
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // 4컷 촬영 완료 시 즉시 3단계(완성본)로 이동
  const handlePhotosCaptured = (capturedPhotos) => {
    setPhotos(capturedPhotos);
    triggerConfetti();
    setCurrentStep(3);
  };

  // 폭죽 축하 효과
  const triggerConfetti = () => {
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // 처음으로 리셋
  const handleResetAll = () => {
    setPhotos([]);
    setFinalDataUrl(null);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center py-8 px-4 selection:bg-pink-500 selection:text-white">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold flex items-center justify-center gap-2 mb-2">
          <Camera className="w-8 h-8 text-pink-400" />
          <span>인생네컷 포토부스</span>
          <Sparkles className="w-8 h-8 text-yellow-300" />
        </h1>
        <p className="text-xs md:text-sm text-slate-400">
          2×2 감성 필름 프레임 • 웹캠 4컷 촬영 • 스마트폰 QR 저장 & 포토 프린터 인쇄
        </p>
      </header>

      {/* Step Indicator */}
      <nav className="w-full max-w-2xl mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 -z-0" />
          {STEPS.map((s) => {
            const isPassed = currentStep > s.id;
            const isCurrent = currentStep === s.id;
            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                    isPassed
                      ? 'bg-pink-500 border-pink-500 text-white'
                      : isCurrent
                      ? 'bg-slate-900 border-pink-400 text-pink-400 shadow-lg shadow-pink-500/30'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-5 h-5" /> : s.id}
                </div>
                <span
                  className={`text-[11px] font-semibold ${
                    isCurrent ? 'text-pink-300' : isPassed ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {s.name}
                </span>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Main Container */}
      <main className="w-full max-w-2xl bg-slate-900/90 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-800 backdrop-blur-xl">
        {/* Step 1: 포토 프레임 2종 선택 */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <FrameSelector
              selectedFrameId={selectedFrame.id}
              onSelectFrame={setSelectedFrame}
            />

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold rounded-2xl shadow-xl flex items-center justify-center gap-2 transition active:scale-95"
              >
                <span>이 프레임으로 촬영하기</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 웹캠 4회 연속 촬영 */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
              >
                <ArrowLeft className="w-4 h-4" /> 프레임 다시 선택
              </button>
              <span className="text-xs text-pink-400 font-semibold">
                선택된 프레임: {selectedFrame.name}
              </span>
            </div>

            <CameraView onPhotosCaptured={handlePhotosCaptured} />
          </div>
        )}

        {/* Step 3: 인생네컷 최종 완성본 & 다운로드 / QR / 프린터 */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  완성 🎉
                </span>
                <span className="text-sm font-bold text-white">{selectedFrame.name}</span>
              </div>
              <button
                type="button"
                onClick={handleResetAll}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> 처음부터 다시 만들기
              </button>
            </div>

            <PhotoStrip
              frame={selectedFrame}
              photos={photos}
              onExportReady={setFinalDataUrl}
              onOpenQr={() => setIsQrOpen(true)}
              onOpenPrint={() => setIsPrintOpen(true)}
            />
          </div>
        )}
      </main>

      {/* QR Code Modal (스마트폰 즉시 다운로드) */}
      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        imageDataUrl={finalDataUrl}
      />

      {/* Print Modal (포토 프린터 규격 인쇄) */}
      <PrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        imageDataUrl={finalDataUrl}
        frameName={selectedFrame.name}
      />
    </div>
  );
}
