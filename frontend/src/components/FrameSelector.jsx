import React from 'react';
import { PHOTO_FRAMES } from '../constants/frames';
import { Check } from 'lucide-react';

export default function FrameSelector({ selectedFrameId, onSelectFrame }) {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
        <span>포토 프레임 선택 (2종)</span>
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {PHOTO_FRAMES.map((frame) => {
          const isSelected = selectedFrameId === frame.id;
          return (
            <button
              key={frame.id}
              type="button"
              onClick={() => onSelectFrame(frame)}
              className={`relative group rounded-xl overflow-hidden border-2 transition-all p-3 text-left flex flex-col items-center ${
                isSelected
                  ? 'border-pink-500 bg-slate-800 shadow-lg shadow-pink-500/20 scale-[1.02]'
                  : 'border-slate-700 bg-slate-800/60 hover:border-slate-500'
              }`}
            >
              <div className="w-full h-48 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center p-2 mb-3">
                <img
                  src={frame.preview}
                  alt={frame.name}
                  className="max-h-full max-w-full object-contain rounded shadow"
                />
              </div>

              <div className="w-full flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-white">{frame.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {frame.width} × {frame.height}px (2×2 4컷)
                  </p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'bg-pink-500 border-pink-500 text-white'
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
