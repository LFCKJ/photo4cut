import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Camera, Sparkles, RefreshCw, ChevronRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { PHOTO_FRAMES } from './constants/frames';
import FrameSelector from './components/FrameSelector';
import CameraView from './components/CameraView';
import StyleSelector, { STYLE_PRESETS } from './components/StyleSelector';
import PhotoStrip from './components/PhotoStrip';
import QrModal from './components/QrModal';
import PrintModal from './components/PrintModal';
import { transformPhotosApi } from './api/photoApi';

const STEPS = [
  { id: 1, name: '프레임 선택' },
  { id: 2, name: '4컷 사진 촬영' },
  { id: 3, name: 'AI 스타일 변환' },
  { id: 4, name: '인생네컷 완성' },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFrame, setSelectedFrame] = useState(PHOTO_FRAMES[0]);
  
  // 촬영된 4장의 원본 사진
  const [rawPhotos, setRawPhotos] = useState([]);
  
  // AI 변환 적용된 4장의 사진 (기본은 원본)
  const [displayPhotos, setDisplayPhotos] = useState([]);
  const [selectedStyleId, setSelectedStyleId] = useState('disney');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isTransforming, setIsTransforming] = useState(false);

  // 최종 렌더링된 합성 DataURL
  const [finalDataUrl, setFinalDataUrl] = useState(null);

  // 모달 제어
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // 1. 촬영 완료 핸들러
  const handlePhotosCaptured = (photos) => {
    setRawPhotos(photos);
    setDisplayPhotos(photos);
    setCurrentStep(3); // 스타일 변환 단계로 이동
  };

  // 2. AI 스타일 변환 적용 핸들러
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
    setSelectedStyleId('original');
    setFinalDataUrl(null);
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
          2×2 필름 프레임 • 웹캠 자동 4회 캡처 • AI 스타일 변환 • QR 모바일 저장 & 프린터 인쇄
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
        {/* Step 1: 프레임 선택 */}
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
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold rounded-2xl shadow-xl flex items-center gap-2 transition active:scale-95"
              >
                <span>이 프레임으로 촬영하기</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 웹캠 촬영 */}
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

        {/* Step 3: AI 스타일 변환 */}
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
                촬영된 4장의 사진에 원하는 AI 감성을 입혀보세요.
              </span>
            </div>

            {/* 촬영된 4장 미리보기 */}
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
