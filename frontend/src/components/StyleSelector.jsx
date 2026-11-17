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
} from 'lucide-react';
import { STYLE_PRESETS, DEFAULT_EXAMPLE_STYLES } from '../constants/styles';
import { transformPhotosApi } from '../api/photoApi';

const ICON_MAP = {
  Sparkles,
  Wand2,
  Heart,
  Zap,
  Crown,
};

export default function StyleSelector({
  photos,
  onTransformComplete,
  onSkipAi,
}) {
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
      <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-pink-500/20 rounded-lg text-pink-400 border border-pink-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white">4컷 AI 컨셉 & 필터 선택</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            아래 예시를 참고해 4장의 사진마다 원하는 AI 스타일을 자유롭게 조합해 보세요.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSkipAi(photos)}
          className="text-xs text-slate-400 hover:text-white underline underline-offset-4 transition shrink-0"
        >
          AI 변환 없이 원본만 출력
        </button>
      </div>

      {/* 1. 4컷 AI 변환 예시 가이드 */}
      <div className="bg-slate-900/70 rounded-2xl border border-slate-800 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-lime-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              AI 인생네컷 변환 예시 (추천 조합)
            </span>
          </div>
          <button
            type="button"
            onClick={handleApplyExample}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto ${
              isExampleMatched
                ? 'bg-lime-500/20 text-lime-300 border border-lime-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
            }`}
          >
            {isExampleMatched ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>예시 조합 적용됨</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                <span>이 예시대로 4컷 맞추기</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {DEFAULT_EXAMPLE_STYLES.map((styleId, idx) => {
            const info = getStyleInfo(styleId);
            const IconComp = ICON_MAP[info.iconName] || Sparkles;

            return (
              <div
                key={idx}
                className="rounded-xl bg-slate-950/80 border border-slate-800/90 overflow-hidden flex flex-col"
              >
                <div
                  className={`h-14 bg-gradient-to-br ${info.previewGradient} relative flex items-center justify-center`}
                >
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[10px] font-black text-white backdrop-blur-sm">
                    예시 #{idx + 1}
                  </span>
                  <IconComp className="w-6 h-6 text-white drop-shadow-md" />
                </div>
                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">{info.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
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
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>내 사진별 컨셉 지정 (슬롯을 눌러 변경)</span>
          </label>
          <span className="text-xs text-pink-400 font-bold">
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
                className={`cursor-pointer rounded-2xl p-2.5 border-2 transition-all relative overflow-hidden flex flex-col items-center text-center ${
                  isActive
                    ? 'border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/20 ring-2 ring-pink-500/35 -translate-y-0.5'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                {/* 컷 번호 뱃지 */}
                <div className="absolute top-3.5 left-3.5 z-10 px-2 py-0.5 rounded-md text-[10px] font-black bg-black/80 text-white backdrop-blur-sm border border-white/20">
                  #{idx + 1}컷
                </div>

                {/* 사진 썸네일 미리보기 */}
                <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 mb-2 relative">
                  {photoSrc && (
                    <img
                      src={photoSrc}
                      alt={`컷 ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${info.previewGradient} opacity-30 mix-blend-color`}
                  />
                  <div className="absolute bottom-1.5 right-1.5 p-1.5 rounded-lg bg-black/75 backdrop-blur-sm border border-white/10">
                    <IconComp className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                {/* 적용된 컨셉 뱃지 */}
                <span
                  className={`w-full text-center text-xs font-bold py-1 px-2 rounded-lg border truncate ${info.badgeColor}`}
                >
                  {info.name}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                  {info.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 활성화된 슬롯에 적용할 5가지 AI 필터 팔레트 */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-pink-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-pink-500/30">
              {activeSlotIndex + 1}
            </span>
            <span className="text-sm font-bold text-white">
              {activeSlotIndex + 1}번째 컷에 적용할 AI 필터 선택
            </span>
          </div>
          <span className="text-xs text-slate-400">
            총 {STYLE_PRESETS.length}가지 AI 스타일
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
                className={`rounded-xl border text-left transition-all overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-pink-500/15 border-pink-500 shadow-md shadow-pink-500/20 ring-1 ring-pink-500'
                    : 'bg-slate-800/70 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                {/* 상단 무드 그라데이션 바 */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${style.previewGradient}`} />

                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-700">
                          <IconComp className="w-3.5 h-3.5 text-pink-400" />
                        </span>
                        <div>
                          <span className="text-xs font-bold text-white block leading-tight">
                            {style.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {style.tag}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-300/90 leading-relaxed mt-1">
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
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Start Transform Action Button */}
      <div className="pt-1">
        <button
          type="button"
          disabled={isLoading}
          onClick={handleStartTransform}
          className="w-full py-4 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-pink-500/25 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>선택한 4가지 컨셉으로 AI 변환 중입니다 (약 5~10초)...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 text-yellow-300" />
              <span>선택한 컨셉으로 인생네컷 완성하기</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
