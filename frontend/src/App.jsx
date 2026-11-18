import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Camera, Sparkles, RefreshCw, ChevronRight, CheckCircle2, ArrowLeft, Wand2 } from 'lucide-react';
import { PHOTO_FRAMES } from './constants/frames';
import { DEFAULT_EXAMPLE_STYLES } from './constants/styles';
import FrameSelector from './components/FrameSelector';
import CameraView from './components/CameraView';
import StyleSelector from './components/StyleSelector';
import PhotoStrip from './components/PhotoStrip';
import QrModal from './components/QrModal';
import PrintModal from './components/PrintModal';

const STEPS = [
  { id: 1, name: '프레임 선택' },
  { id: 2, name: '4컷 촬영' },
  { id: 3, name: 'AI 컨셉' },
  { id: 4, name: '네컷 완성' },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFrame, setSelectedFrame] = useState(PHOTO_FRAMES[0]);

  // 촬영된 원본 4장의 실제 사진
  const [rawPhotos, setRawPhotos] = useState([]);

  // 스타일 변환이 적용된 4장의 최종 사진
  const [processedPhotos, setProcessedPhotos] = useState([]);

  // 각 컷별 적용된 스타일 ID 배열
  const [appliedStyles, setAppliedStyles] = useState([...DEFAULT_EXAMPLE_STYLES]);

  // 최종 렌더링된 4컷 합성 DataURL
  const [finalDataUrl, setFinalDataUrl] = useState(null);

  // 모달 제어 (QR 다운로드, 프린터 인쇄)
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // 1) 4컷 촬영 완료 -> 3단계(4컷 컨셉 & 스타일 선택)로 이동
  const handlePhotosCaptured = (capturedPhotos) => {
    setRawPhotos(capturedPhotos);
    setProcessedPhotos(capturedPhotos);
    setCurrentStep(3);
  };

  // 2) AI 스타일 변환 완료 -> 4단계(최종 완성본)로 이동
  const handleTransformComplete = (transformedImages, styles) => {
    setProcessedPhotos(transformedImages);
    setAppliedStyles(styles);
    triggerConfetti();
    setCurrentStep(4);
  };

  // 3) AI 변환 생략(원본 그대로 바로 완성)
  const handleSkipAi = (photos) => {
    setProcessedPhotos(photos);
    setAppliedStyles(['ORIGINAL', 'ORIGINAL', 'ORIGINAL', 'ORIGINAL']);
    triggerConfetti();
    setCurrentStep(4);
  };

  // 폭죽 축하 효과
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 65,
      origin: { y: 0.6 },
      colors: ['#1C1917', '#E11D48', '#D6D3D1', '#F43F5E'],
    });
  };

  // 처음으로 리셋
  const handleResetAll = () => {
    setRawPhotos([]);
    setProcessedPhotos([]);
    setFinalDataUrl(null);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col items-center py-8 md:py-12 px-4 selection:bg-stone-900 selection:text-white relative overflow-x-hidden">
      {/* Subtle Editorial Studio Ambient Backdrop */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-0">
        <div className="absolute -top-40 left-1/4 w-[32rem] h-[32rem] bg-rose-200/25 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] bg-amber-100/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-[32rem] h-[32rem] bg-stone-200/40 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="mb-8 text-center relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-stone-200/90 shadow-sm text-stone-600 text-[11px] font-semibold tracking-[0.14em] uppercase mb-3.5">
          <Sparkles className="w-3 h-3 text-rose-500" />
          <span>Atelier 4Cut · AI Photo Studio</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold flex items-center justify-center gap-3 mb-2.5 tracking-tight text-stone-900">
          <span className="w-10 h-10 rounded-2xl bg-stone-900 text-white flex items-center justify-center shadow-md shadow-stone-900/15">
            <Camera className="w-5 h-5" />
          </span>
          <span>AI 인생네컷 스튜디오</span>
        </h1>
        <p className="text-xs md:text-sm text-stone-500 font-medium">
          미니멀 필름 프레임 · 4컷 개별 AI 컨셉 · 고해상도 QR & 포토 인쇄
        </p>
      </header>

      {/* Step Indicator */}
      <nav className="w-full max-w-3xl mb-8 relative z-10">
        <div className="flex items-center justify-between relative px-4">
          <div className="absolute top-[18px] left-10 right-10 h-[1.5px] bg-stone-200 -z-0" />
          <div
            className="absolute top-[18px] left-10 h-[1.5px] bg-stone-900 transition-all duration-300 -z-0"
            style={{ width: `calc(${((currentStep - 1) / (STEPS.length - 1)) * 100}% - 5rem)` }}
          />
          {STEPS.map((s) => {
            const isPassed = currentStep > s.id;
            const isCurrent = currentStep === s.id;
            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-200 ${
                    isPassed
                      ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-white border-stone-900 text-stone-900 shadow-md ring-4 ring-stone-900/5 scale-105'
                      : 'bg-[#FAF8F5] border-stone-300 text-stone-400'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : `0${s.id}`}
                </div>
                <span
                  className={`text-[11px] tracking-tight ${
                    isCurrent
                      ? 'font-bold text-stone-900'
                      : isPassed
                      ? 'font-semibold text-stone-600'
                      : 'font-medium text-stone-400'
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
      <main className="w-full max-w-3xl bg-white rounded-[28px] p-6 md:p-9 shadow-[0_20px_60px_-15px_rgba(28,25,23,0.08)] border border-stone-200/80 relative z-10">
        {/* Step 1: 포토 프레임 선택 */}
        {currentStep === 1 && (
          <div className="space-y-7">
            <FrameSelector
              selectedFrameId={selectedFrame.id}
              onSelectFrame={setSelectedFrame}
            />

            <div className="pt-5 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-stone-500">
                선택된 프레임: <strong className="text-stone-900">{selectedFrame.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full sm:w-auto px-8 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm rounded-2xl shadow-lg shadow-stone-900/15 flex items-center justify-center gap-2 transition active:scale-[0.98]"
              >
                <span>이 프레임으로 촬영하기</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 웹캠 4회 연속 촬영 */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-semibold text-stone-500 hover:text-stone-900 flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" /> 프레임 다시 선택
              </button>
              <span className="text-xs px-3 py-1 rounded-full bg-stone-100 text-stone-700 font-semibold border border-stone-200/70">
                {selectedFrame.name}
              </span>
            </div>

            <CameraView onPhotosCaptured={handlePhotosCaptured} />
          </div>
        )}

        {/* Step 3: 4컷 개별 AI 컨셉 & 스타일 선택 */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-xs font-semibold text-stone-500 hover:text-stone-900 flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" /> 사진 다시 촬영하기
              </button>
              <span className="text-xs px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                4컷 촬영 완료
              </span>
            </div>

            <StyleSelector
              photos={rawPhotos}
              frame={selectedFrame}
              onTransformComplete={handleTransformComplete}
              onSkipAi={handleSkipAi}
            />
          </div>
        )}

        {/* Step 4: 인생네컷 최종 완성본 & 다운로드 / QR / 프린터 */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-900 text-white">
                  COMPLETE
                </span>
                <span className="text-sm font-bold text-stone-900">{selectedFrame.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 transition"
                >
                  <Wand2 className="w-3.5 h-3.5" /> 컨셉 변경
                </button>
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="text-xs text-stone-500 hover:text-stone-900 font-semibold flex items-center gap-1 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> 처음부터
                </button>
              </div>
            </div>

            <PhotoStrip
              frame={selectedFrame}
              photos={processedPhotos}
              appliedStyles={appliedStyles}
              onChangeStyles={() => setCurrentStep(3)}
              onExportReady={setFinalDataUrl}
              onOpenQr={() => setIsQrOpen(true)}
              onOpenPrint={() => setIsPrintOpen(true)}
            />
          </div>
        )}
      </main>

      <footer className="mt-8 text-[11px] text-stone-400 tracking-wide relative z-10">
        ATELIER 4CUT · MODERN MINIMAL PHOTO STUDIO
      </footer>

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
