import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Camera, Sparkles, RefreshCw, ChevronRight, CheckCircle2, ArrowLeft, Wand2 } from 'lucide-react';
import { PHOTO_FRAMES } from './constants/frames';
import FrameSelector from './components/FrameSelector';
import CameraView from './components/CameraView';
import StyleSelector, { STYLE_PRESETS } from './components/StyleSelector';
import PhotoStrip from './components/PhotoStrip';
import QrModal from './components/QrModal';
import PrintModal from './components/PrintModal';
import { transformPhotosApi } from './api/photoApi';
import { usePhotoBooth } from './hooks/usePhotoBooth';

const STEPS = [
  { id: 1, name: '프레임 & 스타일 선택' },
  { id: 2, name: '실시간 4컷 촬영' },
  { id: 3, name: 'AI 스타일 재조정' },
  { id: 4, name: '인생네컷 완성' },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFrame, setSelectedFrame] = useState(PHOTO_FRAMES[0]);
  const [selectedStyleId, setSelectedStyleId] = useState('ghibli');
  const [customPrompt, setCustomPrompt] = useState('');

  // 실시간 비동기 백그라운드 파이프라인 훅 (ai (1).md 핵심)
  const { photoItems, captureAndConvert, isProcessing, resetBooth } = usePhotoBooth(selectedStyleId);

  // 촬영된 원본 및 최종 표시용 사진 목록
  const [rawPhotos, setRawPhotos] = useState([]);
  const [displayPhotos, setDisplayPhotos] = useState([]);
  const [isTransforming, setIsTransforming] = useState(false);

  // 최종 렌더링된 합성 DataURL
  const [finalDataUrl, setFinalDataUrl] = useState(null);

  // 모달 제어
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // 백그라운드 AI 변환 완료 시 displayPhotos 실시간 동기화
  useEffect(() => {
    if (rawPhotos.length === 0) return;
    const updated = rawPhotos.map((p, idx) => {
      const match = photoItems.find((item) => item.index === idx + 1);
      return match?.converted || p;
    });
    setDisplayPhotos(updated);
  }, [photoItems, rawPhotos]);

  // 1. 매 컷 촬영 즉시 비동기 백엔드 AI 변환 발송 (Instant Pipeline)
  const handleEachCapture = (photo, stepIndex) => {
    captureAndConvert(photo, stepIndex);
  };

  // 2. 4회 촬영 모두 완료 시
  const handlePhotosCaptured = (photos) => {
    setRawPhotos(photos);

    // 백그라운드에서 이미 변환 완료된 결과 매핑
    const convertedList = photos.map((p, idx) => {
      const match = photoItems.find((item) => item.index === idx + 1);
      return match?.converted || p;
    });

    setDisplayPhotos(convertedList);
    triggerConfetti();
    // 촬영 끝나자마자 즉시 완성 화면(Step 4)으로 직행! (필요 시 Step 3에서 스타일 변경 가능)
    setCurrentStep(4);
  };

  // 3. 완료 화면이나 Step 3에서 다른 스타일로 재변환 요청 시
  const handleApplyTransform = async () => {
    if (selectedStyleId === 'original') {
      setDisplayPhotos(rawPhotos);
      triggerConfetti();
      setCurrentStep(4);
      return;
    }

    try {
      setIsTransforming(true);
      const res = await transformPhotosApi(rawPhotos, selectedStyleId, customPrompt);
      if (res && res.transformedImages) {
        setDisplayPhotos(res.transformedImages);
      }
      triggerConfetti();
      setCurrentStep(4);
    } catch (err) {
      console.warn('AI 변환 실패, 원본으로 진행:', err);
      setDisplayPhotos(rawPhotos);
      setCurrentStep(4);
    } finally {
      setIsTransforming(false);
    }
  };

  // 폭죽 축하 효과
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // 처음으로 리셋
  const handleResetAll = () => {
    setRawPhotos([]);
    setDisplayPhotos([]);
    setSelectedStyleId('ghibli');
    setFinalDataUrl(null);
    resetBooth();
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center py-8 px-4 selection:bg-pink-500 selection:text-white">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold flex items-center justify-center gap-2 mb-2">
          <Camera className="w-8 h-8 text-pink-400" />
          <span>AI 인생네컷 부스</span>
          <Sparkles className="w-8 h-8 text-yellow-300" />
        </h1>
        <p className="text-xs md:text-sm text-slate-400">
          실시간 촬영 즉시 비동기 AI 변환 • 지브리/디즈니 3D/웹툰 • 2×2 필름 프레임 • QR 저장 & 프린트
        </p>
      </header>

      {/* Step Indicator */}
      <nav className="w-full max-w-3xl mb-8">
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
      <main className="w-full max-w-3xl bg-slate-900/90 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-800 backdrop-blur-xl">
        {/* Step 1: 프레임 및 사전 AI 스타일 선택 */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <FrameSelector
              selectedFrameId={selectedFrame.id}
              onSelectFrame={setSelectedFrame}
            />

            <div className="pt-4 border-t border-slate-800">
              <StyleSelector
                selectedStyleId={selectedStyleId}
                onSelectStyle={setSelectedStyleId}
                customPrompt={customPrompt}
                onCustomPromptChange={setCustomPrompt}
                onApplyTransform={() => setCurrentStep(2)}
              />
            </div>
          </div>
        )}

        {/* Step 2: 웹캠 촬영 (촬영 즉시 비동기 AI 파이프라인 가동) */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
              >
                <ArrowLeft className="w-4 h-4" /> 프레임/스타일 다시 선택
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-pink-400 font-semibold bg-pink-500/10 px-2.5 py-1 rounded-full border border-pink-500/30">
                  ⚡ 실시간 비동기 AI 변환 활성화
                </span>
              </div>
            </div>

            <CameraView
              onPhotosCaptured={handlePhotosCaptured}
              onEachCapture={handleEachCapture}
              photoItems={photoItems}
            />
          </div>
        )}

        {/* Step 3: AI 스타일 재조정 및 변환 (촬영 후 다른 스타일로 바꿀 때) */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
              >
                <ArrowLeft className="w-4 h-4" /> 재촬영하기
              </button>
              <span className="text-xs text-slate-400">
                다른 AI 스타일로 다시 변환해볼 수 있습니다.
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {rawPhotos.map((p, idx) => (
                <div key={idx} className="aspect-[3/4] rounded-xl overflow-hidden border border-slate-700 bg-black">
                  <img src={p} alt={`사진 ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <StyleSelector
              selectedStyleId={selectedStyleId}
              onSelectStyle={setSelectedStyleId}
              onApplyTransform={handleApplyTransform}
              isTransforming={isTransforming}
              customPrompt={customPrompt}
              onCustomPromptChange={setCustomPrompt}
            />
          </div>
        )}

        {/* Step 4: 인생네컷 최종본 & 공유/인쇄 */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  완성 🎉
                </span>
                <span className="text-sm font-bold text-white">{selectedFrame.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1 transition bg-pink-500/10 px-2.5 py-1 rounded-lg border border-pink-500/20"
                >
                  <Wand2 className="w-3.5 h-3.5" /> 다른 AI 스타일 적용
                </button>
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> 처음부터
                </button>
              </div>
            </div>

            <PhotoStrip
              frame={selectedFrame}
              photos={displayPhotos}
              onExportReady={setFinalDataUrl}
              onOpenQr={() => setIsQrOpen(true)}
              onOpenPrint={() => setIsPrintOpen(true)}
            />
          </div>
        )}
      </main>

      {/* QR Code Modal */}
      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        imageDataUrl={finalDataUrl}
      />

      {/* Print Modal */}
      <PrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        imageDataUrl={finalDataUrl}
        frameName={selectedFrame.name}
      />
    </div>
  );
}
