import React from 'react';
import { PHOTO_FRAMES } from '../constants/frames';
import { Check, Layers } from 'lucide-react';

export default function FrameSelector({ selectedFrameId, onSelectFrame }) {
  const getThumbnailBackdrop = (frame) => {
    switch (frame.theme) {
      case 'black':
        return 'bg-[#F3F0EA] border-stone-200/80';
      case 'white':
      default:
        return 'bg-stone-900 border-stone-800';
    }
  };

  const getThemeBadge = (frame) => {
    switch (frame.theme) {
      case 'black':
        return { label: 'BLACK FILM', style: 'bg-stone-900 text-white border-stone-900' };
      case 'white':
      default:
        return { label: 'WHITE EDITION', style: 'bg-white text-stone-800 border-stone-300' };
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 mb-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-rose-600 mb-1">
            Step 01 · Frame Selection
          </p>
          <h3 className="text-xl font-extrabold text-stone-900 flex items-center gap-2 tracking-tight">
            <Layers className="w-5 h-5 text-stone-700" />
            <span>포토 프레임 선택</span>
          </h3>
        </div>
        <span className="text-xs text-stone-500 font-medium">
          총 {PHOTO_FRAMES.length}종의 시그니처 프레임 중 선택해 주세요
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PHOTO_FRAMES.map((frame) => {
          const isSelected = selectedFrameId === frame.id;
          const isBlackFrame = frame.theme === 'black';
          const badge = getThemeBadge(frame);

          return (
            <button
              key={frame.id}
              type="button"
              onClick={() => onSelectFrame(frame)}
              className={`relative group rounded-2xl overflow-hidden border transition-all duration-200 p-3.5 text-left flex flex-col justify-between hover:-translate-y-0.5 ${
                isSelected
                  ? 'border-stone-900 bg-[#FAF8F5] shadow-[0_12px_30px_-10px_rgba(28,25,23,0.18)] ring-2 ring-stone-900/15'
                  : 'border-stone-200 bg-white hover:border-stone-400 hover:shadow-md'
              }`}
            >
              {/* Check Circle (Top Right) */}
              <div
                className={`absolute top-3 right-3 z-10 w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                  isSelected
                    ? 'bg-stone-900 border-stone-900 text-white shadow-sm scale-105'
                    : 'border-stone-300 bg-white/90 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>

              {/* Thumbnail Display Box (4x6 포토카드 비율 2:3) */}
              <div
                className={`w-full h-56 rounded-xl overflow-hidden flex items-center justify-center p-3 mb-3.5 transition-colors border ${getThumbnailBackdrop(
                  frame
                )}`}
              >
                <div
                  className={`h-full aspect-[2/3] rounded overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${
                    isBlackFrame
                      ? 'bg-black drop-shadow-[0_10px_18px_rgba(28,25,23,0.22)]'
                      : 'bg-[#f4f4f4] drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)]'
                  }`}
                >
                  <img
                    src={frame.preview}
                    alt={frame.name}
                    className={`w-full h-full ${
                      frame.overlayOffsetY < 0 ? 'object-cover object-center' : 'object-contain'
                    }`}
                  />
                </div>
              </div>

              {/* Title & Info Bar */}
              <div className="w-full space-y-1.5">
                <span
                  className={`inline-block text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border ${badge.style}`}
                >
                  {badge.label}
                </span>
                <p className="font-bold text-xs text-stone-900 line-clamp-2 leading-snug">
                  {frame.name}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
