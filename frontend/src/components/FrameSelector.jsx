import React from 'react';
import { PHOTO_FRAMES } from '../constants/frames';
import { Check, Sparkles } from 'lucide-react';

export default function FrameSelector({ selectedFrameId, onSelectFrame }) {
  // 프레임별 최적의 썸네일 대비 배경 클래스
  const getThumbnailBackdrop = (frame) => {
    switch (frame.theme) {
      case 'black':
        return 'bg-gradient-to-b from-slate-100 to-slate-200 border-slate-300';
      case 'blue':
        return 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800';
      case 'yellow':
        return 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800';
      case 'white':
      default:
        return 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-700';
    }
  };

  const getThemeBadge = (frame) => {
    switch (frame.theme) {
      case 'black':
        return { label: '블랙 필름', style: 'bg-black text-white border-slate-700' };
      case 'blue':
        return { label: '하치와레 블루', style: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
      case 'yellow':
        return { label: '우사기 옐로우', style: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'white':
      default:
        return { label: '화이트/콜라주', style: 'bg-white text-slate-900 border-slate-300' };
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-400" />
          <span>포토 프레임 선택 (총 6종)</span>
        </h3>
        <span className="text-xs text-slate-400">
          원하는 캐릭터 및 필름 프레임을 선택해 주세요
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        {PHOTO_FRAMES.map((frame) => {
          const isSelected = selectedFrameId === frame.id;
          const isBlackFrame = frame.theme === 'black';
          const badge = getThemeBadge(frame);

          return (
            <button
              key={frame.id}
              type="button"
              onClick={() => onSelectFrame(frame)}
              className={`relative group rounded-2xl overflow-hidden border-2 transition-all p-3 text-left flex flex-col justify-between ${
                isSelected
                  ? 'border-pink-500 bg-slate-800/95 shadow-xl shadow-pink-500/25 ring-2 ring-pink-500/20 scale-[1.02]'
                  : 'border-slate-800 bg-slate-850 hover:border-slate-600 bg-slate-900/60'
              }`}
            >
              {/* Thumbnail Display Box: 프레임 테마별 지능형 대비 배경 */}
              <div
                className={`w-full h-48 rounded-xl overflow-hidden flex items-center justify-center p-2 mb-2.5 transition-colors border ${getThumbnailBackdrop(
                  frame
                )}`}
              >
                <img
                  src={frame.preview}
                  alt={frame.name}
                  className={`max-h-full max-w-full object-contain rounded transition-transform duration-200 group-hover:scale-105 ${
                    isBlackFrame
                      ? 'drop-shadow-[0_6px_12px_rgba(0,0,0,0.35)]'
                      : 'drop-shadow-[0_6px_12px_rgba(255,255,255,0.15)]'
                  }`}
                />
              </div>

              {/* Title & Info Bar */}
              <div className="w-full flex items-center justify-between pt-1">
                <div className="space-y-1 min-w-0 pr-1">
                  <span
                    className={`inline-block text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border ${badge.style}`}
                  >
                    {badge.label}
                  </span>
                  <p className="font-bold text-xs text-white truncate">{frame.name}</p>
                </div>

                {/* Check Circle */}
                <div
                  className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'bg-pink-500 border-pink-500 text-white shadow-md'
                      : 'border-slate-700 bg-slate-900 text-transparent'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
