import React from 'react';
import { Sparkles, Palette, Check, Wand2, Loader2 } from 'lucide-react';

export const STYLE_PRESETS = [
  {
    id: 'original',
    name: 'Natural (원본)',
    desc: '촬영 원본 그대로의 자연스러운 색감',
    badge: '기본',
    color: 'from-slate-600 to-slate-800',
  },
  {
    id: 'retro',
    name: 'Retro Film (레트로)',
    desc: '아날로그 감성의 클래식 세피아 필름 톤',
    badge: '인기',
    color: 'from-amber-700 to-yellow-900',
  },
  {
    id: 'comic',
    name: 'Comic Pop (카툰)',
    desc: '선명한 잉크 라인과 위트 있는 팝아트 스타일',
    badge: '추천',
    color: 'from-rose-500 to-orange-600',
  },
  {
    id: 'watercolor',
    name: 'Watercolor (수채화)',
    desc: '부드럽고 몽환적인 파스텔 수채화 감성',
    badge: '화사함',
    color: 'from-teal-500 to-emerald-700',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk (네온)',
    desc: '미래지향적인 네온 핑크 & 시안 듀오톤',
    badge: '트렌디',
    color: 'from-fuchsia-600 to-cyan-600',
  },
];

export default function StyleSelector({
  selectedStyleId,
  onSelectStyle,
  onApplyTransform,
  isTransforming,
}) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <Palette className="w-5 h-5 text-pink-400" />
          <span>AI 스타일 변환 프리셋</span>
        </h3>
        {isTransforming && (
          <span className="text-xs text-pink-400 flex items-center gap-1.5 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            AI 변환 파이프라인 처리 중...
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {STYLE_PRESETS.map((style) => {
          const isSelected = selectedStyleId === style.id;
          return (
            <button
              key={style.id}
              type="button"
              disabled={isTransforming}
              onClick={() => onSelectStyle(style.id)}
              className={`relative rounded-xl p-3 border-2 transition-all flex flex-col justify-between text-left ${
                isSelected
                  ? 'border-pink-500 bg-slate-800 shadow-lg shadow-pink-500/20 scale-105'
                  : 'border-slate-700 bg-slate-800/60 hover:border-slate-500'
              } ${isTransforming ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-6 h-6 rounded-lg bg-gradient-to-br ${style.color} shadow flex items-center justify-center text-[10px] font-black text-white`}
                  >
                    AI
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                    {style.badge}
                  </span>
                </div>
                <p className="font-bold text-sm text-white">{style.name}</p>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{style.desc}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-end">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'bg-pink-500 border-pink-500 text-white'
                      : 'border-slate-600 bg-slate-900 text-transparent'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={isTransforming}
          onClick={onApplyTransform}
          className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition"
        >
          {isTransforming ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              변환 적용 중...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              선택한 스타일로 AI 변환 적용하기
            </>
          )}
        </button>
      </div>
    </div>
  );
}
