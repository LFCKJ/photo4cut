import React, { useState } from 'react';
import { Sparkles, Palette, Check, Wand2, Loader2, Smile, ChevronDown, ChevronUp } from 'lucide-react';

export const STYLE_PRESETS = [
  {
    id: 'disney',
    name: '디즈니 3D 애니메이션',
    subtitle: 'Disney / Pixar Style',
    desc: '디즈니/픽사 캐릭터 특유의 큰 눈망울, 매끄러운 3D 볼륨감과 동화적 조명',
    badge: '추천',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    emoji: '🏰',
    gradient: 'from-amber-400 via-rose-500 to-purple-600',
  },
  {
    id: 'ghibli',
    name: '스튜디오 지브리 애니',
    subtitle: 'Studio Ghibli Style',
    desc: '미야자키 하야오 감성의 서정적인 수채화 톤, 셀 애니메이션과 청량한 감성',
    badge: '인기',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    emoji: '🍃',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
  },
  {
    id: 'beauty',
    name: 'AI 아이돌 뷰티 보정',
    subtitle: 'K-Idol Beauty Retouch',
    desc: '무결점 도자기 피부 스무딩, 화사한 톤업, 맑고 또렷한 눈매의 프로필 보정',
    badge: '필수',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    emoji: '✨',
    gradient: 'from-pink-400 via-fuchsia-500 to-indigo-500',
  },
  {
    id: 'webtoon',
    name: 'K-웹툰 일러스트',
    subtitle: 'Webtoon / Manhwa',
    desc: '선명한 잉크 윤곽선과 트렌디한 디지털 채색의 주인공 비주얼',
    badge: '트렌디',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    emoji: '🎨',
    gradient: 'from-violet-500 via-purple-600 to-blue-600',
  },
  {
    id: 'original',
    name: '내추럴 원본',
    subtitle: 'Natural Real',
    desc: '필터 없이 본연의 자연스러운 매력과 필름 프레임 감성 그대로',
    badge: '기본',
    badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    emoji: '📸',
    gradient: 'from-slate-600 to-slate-700',
  },
];

export default function StyleSelector({
  selectedStyleId,
  onSelectStyle,
  onApplyTransform,
  isTransforming,
  customPrompt,
  onCustomPromptChange,
}) {
  const [showPromptInput, setShowPromptInput] = useState(false);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Palette className="w-5 h-5 text-pink-400" />
          <span>인물 AI 변환 스타일 선택</span>
        </h3>
        {isTransforming && (
          <span className="text-xs text-pink-400 flex items-center gap-1.5 animate-pulse font-semibold">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            AI 얼굴 스타일 렌더링 중...
          </span>
        )}
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {STYLE_PRESETS.map((style) => {
          const isSelected = selectedStyleId === style.id;
          return (
            <button
              key={style.id}
              type="button"
              disabled={isTransforming}
              onClick={() => onSelectStyle(style.id)}
              className={`relative rounded-2xl p-4 border-2 transition-all flex flex-col justify-between text-left group ${
                isSelected
                  ? 'border-pink-500 bg-slate-800/95 shadow-xl shadow-pink-500/25 ring-2 ring-pink-500/20 scale-[1.02]'
                  : 'border-slate-800 bg-slate-850 hover:border-slate-700 bg-slate-900/60'
              } ${isTransforming ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-xl shadow-md`}
                  >
                    {style.emoji}
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${style.badgeColor}`}
                  >
                    {style.badge}
                  </span>
                </div>

                <p className="font-extrabold text-base text-white">{style.name}</p>
                <p className="text-xs font-semibold text-pink-400/90 mt-0.5">{style.subtitle}</p>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {style.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {isSelected ? '선택됨' : '클릭하여 선택'}
                </span>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'bg-pink-500 border-pink-500 text-white shadow-sm'
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

      {/* Advanced Custom Prompt Toggle */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <button
          type="button"
          onClick={() => setShowPromptInput(!showPromptInput)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>추가 AI 디테일 프롬프트 설정 (선택사항)</span>
          {showPromptInput ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showPromptInput && (
          <div className="mt-2.5 bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <input
              type="text"
              value={customPrompt || ''}
              onChange={(e) => onCustomPromptChange && onCustomPromptChange(e.target.value)}
              placeholder="예: 안경 착용, 밝은 미소, 벚꽃 잎 날림, 따뜻한 노을빛..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              원하는 인물 묘사나 분위기 키워드를 추가하면 AI 모델이 반영합니다.
            </p>
          </div>
        )}
      </div>

      {/* Apply Button */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          disabled={isTransforming}
          onClick={onApplyTransform}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-pink-500/25 flex items-center justify-center gap-2.5 transition active:scale-95"
        >
          {isTransforming ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>AI 변환 중... (잠시만 기다려 주세요)</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              <span>선택한 AI 스타일 적용하기</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
