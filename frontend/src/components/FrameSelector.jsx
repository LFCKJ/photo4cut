import React from 'react';
import { PHOTO_FRAMES } from '../constants/frames';
import { Check } from 'lucide-react';

export default function FrameSelector({ selectedFrameId, onSelectFrame }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <span>포토 프레임 선택 (2종)</span>
        </h3>
        <span className="text-xs text-slate-400">
          원하는 무드의 필름 프레임을 선택해 주세요
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PHOTO_FRAMES.map((frame) => {
          const isSelected = selectedFrameId === frame.id;
          const isBlackFrame = frame.theme === 'black' || frame.id === 'black-film';

          return (
            <button
              key={frame.id}
              type="button"
              onClick={() => onSelectFrame(frame)}
              className={`relative group rounded-2xl overflow-hidden border-2 transition-all p-3.5 text-left flex flex-col justify-between ${
                isSelected
                  ? 'border-pink-500 bg-slate-800/95 shadow-xl shadow-pink-500/20 ring-2 ring-pink-500/20 scale-[1.02]'
                  : 'border-slate-700/80 bg-slate-800/50 hover:border-slate-500'
              }`}
            >
              {/* Thumbnail Display Box: 검정 프레임은 흰색 바탕, 흰색 프레임은 다크 바탕으로 완벽 대비 */}
              <div
                className={`w-full h-56 rounded-xl overflow-hidden flex items-center justify-center p-3 mb-3.5 transition-colors border ${
                  isBlackFrame
                    ? 'bg-gradient-to-b from-slate-100 to-slate-200 border-slate-300'
                    : 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-700'
                }`}
              >
                <img
                  src={frame.preview}
                  alt={frame.name}
                  className={`max-h-full max-w-full object-contain rounded transition-transform group-hover:scale-105 ${
                    isBlackFrame
                      ? 'drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]'
                      : 'drop-shadow-[0_8px_16px_rgba(255,255,255,0.15)]'
                  }`}
                />
              </div>

              {/* Title & Info Bar */}
              <div className="w-full flex items-center justify-between pt-1">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        isBlackFrame
                          ? 'bg-black/80 text-white border-slate-700'
                          : 'bg-white text-slate-900 border-slate-300'
                      }`}
                    >
                      {isBlackFrame ? '블랙 빈티지' : '화이트 클린'}
                    </span>
                    <p className="font-bold text-sm text-white">{frame.name.split('(')[0].trim()}</p>
                  </div>
                  <p className="text-xs text-slate-400">
                    {frame.width} × {frame.height}px • 2×2 필름 규격
                  </p>
                </div>

                {/* Check Circle */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'bg-pink-500 border-pink-500 text-white shadow-md'
                      : 'border-slate-600 bg-slate-900 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
