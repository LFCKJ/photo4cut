import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  CheckCircle2,
  Heart,
  Zap,
  Crown,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  Check,
  Camera,
} from 'lucide-react';
import { STYLE_PRESETS, DEFAULT_EXAMPLE_STYLES } from '../constants/styles';
import { transformPhotosApi } from '../api/photoApi';

const ICON_MAP = {
  Sparkles,
  Wand2,
  Heart,
  Zap,
  Crown,
  Camera,
};

export default function StyleSelector({
  photos,
  frame,
  onTransformComplete,
  onSkipAi,
}) {
  const firstSlot = frame?.slots?.[0];
  const slotAspect = firstSlot ? firstSlot.width / firstSlot.height : 2 / 3;
  // 4개 슬롯 각각에 지정된 스타일 ID (기본값: AI 뷰티 보정 -> 지브리 -> 네온 클럽 -> 르네상스)
  const [selectedStyles, setSelectedStyles] = useState([...DEFAULT_EXAMPLE_STYLES]);

  // 현재 커스텀 선택 중인 슬롯 인덱스 (0~3)
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);

  // 로딩 상태 & 에러 상태
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const getStyleInfo = (styleId) => {
    return STYLE_PRESETS.find((s) => s.id === styleId) || STYLE_PRESETS[0];
  };

  const isExampleMatched = DEFAULT_EXAMPLE_STYLES.every(
    (st, idx) => st === selectedStyles[idx]
  );

  // 슬롯별 스타일 변경
  const handleSelectStyleForActiveSlot = (styleId) => {
    const nextStyles = [...selectedStyles];
    nextStyles[activeSlotIndex] = styleId;
    setSelectedStyles(nextStyles);

    if (activeSlotIndex < 3) {
      setActiveSlotIndex(activeSlotIndex + 1);
    }
  };

  // 기본 예시 조합 적용
  const handleApplyExample = () => {
    setSelectedStyles([...DEFAULT_EXAMPLE_STYLES]);
  };

  // AI 변환 실행
  const handleStartTransform = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const allOriginal = selectedStyles.every((s) => s === 'ORIGINAL');
    if (allOriginal) {
      setIsLoading(false);
      onTransformComplete(photos, selectedStyles);
      return;
    }

    try {
      const res = await transformPhotosApi(photos, selectedStyles);
      if (res && res.transformedImages && res.transformedImages.length > 0) {
        onTransformComplete(res.transformedImages, selectedStyles);
      } else {
        throw new Error('변환된 이미지가 비어 있습니다.');
      }
    } catch (err) {
      console.error('AI Transform failed:', err);
      setErrorMessage(
        'AI 변환 서버 연결 중 지연이 발생하여 원본으로 합성합니다. (재시도 가능)'
      );
      setTimeout(() => {
        onTransformComplete(photos, selectedStyles);
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Step Header */}
      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white rounded-lg text-rose-600 border border-stone-200 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-extrabold text-stone-900">4컷 AI 컨셉 & 필터 선택</h3>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            아래 예시를 참고해 4장의 사진마다 원하는 AI 스타일을 자유롭게 조합해 보세요.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSkipAi(photos)}
          className="text-xs font-semibold text-stone-500 hover:text-stone-900 underline underline-offset-4 transition shrink-0"
        >
          AI 변환 없이 원본만 출력
        </button>
      </div>

      {/* 1. 4컷 AI 변환 예시 가이드 */}
      <div className="bg-[#FAF8F5] rounded-2xl border border-stone-200/80 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-stone-700" />
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              AI 인생네컷 변환 예시 (추천 조합)
            </span>
          </div>
          <button
            type="button"
            onClick={handleApplyExample}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto border ${
              isExampleMatched
                ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-300'
            }`}
          >
            {isExampleMatched ? (
              <>
                <Check className="w-3.5 h-3.5 text-rose-400" />
                <span>예시 조합 적용됨</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>이 예시대로 4컷 맞추기</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DEFAULT_EXAMPLE_STYLES.map((styleId, idx) => {
            const info = getStyleInfo(styleId);
            const IconComp = ICON_MAP[info.iconName] || Sparkles;

            return (
              <div
                key={idx}
                className="rounded-xl bg-white border border-stone-200/90 overflow-hidden flex flex-col group shadow-sm"
              >
                <div className="aspect-[3/4] w-full relative overflow-hidden bg-stone-100">
                  {info.exampleImage ? (
                    <img
                      src={info.exampleImage}
                      alt={info.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-gradient-to-br ${info.previewGradient} flex items-center justify-center`}
                    >
                      <IconComp className="w-8 h-8 text-white drop-shadow-md" />
                    </div>
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 text-[10px] font-bold text-stone-900 backdrop-blur-sm shadow-sm">
                    예시 #{idx + 1}
                  </span>
                  <span className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm">
                    <IconComp className="w-3 h-3 text-stone-800" />
                  </span>
                </div>
                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold text-stone-900">{info.name}</p>
                    <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">
                      {info.exampleCaption}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. 4컷 슬롯 선택기 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-stone-900" />
            <span>내 사진별 컨셉 지정 (슬롯을 눌러 변경)</span>
          </label>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
            현재 선택: #{activeSlotIndex + 1}컷
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {selectedStyles.map((styleId, idx) => {
            const info = getStyleInfo(styleId);
            const photoSrc = photos[idx] || photos[0];
            const isActive = activeSlotIndex === idx;
            const IconComp = ICON_MAP[info.iconName] || Sparkles;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlotIndex(idx)}
                className={`cursor-pointer rounded-2xl p-2.5 border transition-all relative overflow-hidden flex flex-col items-center text-center ${
                  isActive
                    ? 'border-stone-900 bg-[#FAF8F5] shadow-md ring-2 ring-stone-900/10 -translate-y-0.5'
                    : 'border-stone-200 bg-white hover:border-stone-400'
                }`}
              >
                {/* 컷 번호 뱃지 */}
                <div className="absolute top-3.5 left-3.5 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 text-stone-900 backdrop-blur-sm shadow-sm">
                  #{idx + 1}컷
                </div>

                {/* 사진 썸네일 미리보기 */}
                <div
                  style={{ aspectRatio: slotAspect }}
                  className="w-full rounded-xl overflow-hidden bg-stone-100 mb-2.5 relative"
                >
                  {photoSrc && (
                    <img
                      src={photoSrc}
                      alt={`컷 ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${info.previewGradient} opacity-25 mix-blend-color`}
                  />
                  <div className="absolute bottom-1.5 right-1.5 p-1.5 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm">
                    <IconComp className="w-3.5 h-3.5 text-stone-800" />
                  </div>
                </div>

                {/* 적용된 컨셉 뱃지 */}
                <span
                  className={`w-full text-center text-[11px] font-bold py-1 px-2 rounded-lg border truncate ${info.badgeColor}`}
                >
                  {info.name}
                </span>
                <span className="text-[10px] text-stone-500 mt-1 line-clamp-1">
                  {info.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 활성화된 슬롯에 적용할 AI 필터 팔레트 */}
      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200/80">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center">
              {activeSlotIndex + 1}
            </span>
            <span className="text-sm font-bold text-stone-900">
              {activeSlotIndex + 1}번째 컷에 적용할 AI 필터 선택
            </span>
          </div>
          <span className="text-xs text-stone-500 font-medium">
            총 {STYLE_PRESETS.length}가지 스타일
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {STYLE_PRESETS.map((style) => {
            const isSelected = selectedStyles[activeSlotIndex] === style.id;
            const IconComp = ICON_MAP[style.iconName] || Sparkles;

            return (
              <button
                key={style.id}
                type="button"
                onClick={() => handleSelectStyleForActiveSlot(style.id)}
                className={`rounded-xl border text-left transition-all overflow-hidden flex flex-col justify-between bg-white ${
                  isSelected
                    ? 'border-stone-900 shadow-md ring-2 ring-stone-900/10'
                    : 'border-stone-200 hover:border-stone-400'
                }`}
              >
                {/* 상단 무드 그라데이션 바 */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${style.previewGradient}`} />

                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-[#FAF8F5] border border-stone-200">
                          <IconComp className="w-3.5 h-3.5 text-stone-800" />
                        </span>
                        <div>
                          <span className="text-xs font-bold text-stone-900 block leading-tight">
                            {style.name}
                          </span>
                          <span className="text-[10px] text-stone-500 font-medium">
                            {style.tag}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-stone-600 leading-relaxed mt-1">
                      {style.desc}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Feedback */}
      {errorMessage && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Start Transform Action Button */}
      <div className="pt-1">
        <button
          type="button"
          disabled={isLoading}
          onClick={handleStartTransform}
          className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-stone-900/15 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-rose-400" />
              <span>선택한 4가지 컨셉으로 AI 변환 중입니다 (약 5~10초)...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 text-rose-400" />
              <span>선택한 컨셉으로 인생네컷 완성하기</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
