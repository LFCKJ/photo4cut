import React, { useState } from 'react';
import { Camera, Sparkles, Image as ImageIcon } from 'lucide-react';
import FrameSelector from './components/FrameSelector';
import { PHOTO_FRAMES } from './constants/frames';

function App() {
  const [selectedFrame, setSelectedFrame] = useState(PHOTO_FRAMES[0]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center py-10 px-4">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold flex items-center justify-center gap-2 mb-2">
          <Camera className="w-8 h-8 text-pink-400" />
          AI 인생네컷 부스
          <Sparkles className="w-8 h-8 text-yellow-300" />
        </h1>
        <p className="text-slate-400">웹캠 다회차 자동 캡처 & AI 스타일 변환 4컷 포토부스</p>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl bg-slate-800/80 rounded-2xl p-6 shadow-2xl border border-slate-700">
        {/* Frame Selection */}
        <section className="mb-8">
          <FrameSelector
            selectedFrameId={selectedFrame.id}
            onSelectFrame={setSelectedFrame}
          />
        </section>

        {/* Selected Frame Info Preview */}
        <section className="bg-slate-900/70 border border-slate-700/80 rounded-xl p-5 flex flex-col md:flex-row items-center gap-6">
          <div className="w-40 h-56 bg-black rounded-lg overflow-hidden flex items-center justify-center p-2 border border-slate-700 flex-shrink-0">
            <img
              src={selectedFrame.preview}
              alt={selectedFrame.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30">
              <ImageIcon className="w-3.5 h-3.5" />
              선택된 프레임
            </div>
            <h2 className="text-xl font-bold text-white">{selectedFrame.name}</h2>
            <p className="text-sm text-slate-300">
              2×2 격자 4컷 레이아웃이 적용되며, 4장의 사진이 각 필름 영역에 자동으로 매핑됩니다.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                캔버스 규격: {selectedFrame.width} × {selectedFrame.height}px
              </span>
              <span className="bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                슬롯 수: 4개 (2×2)
              </span>
              <span className="bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                오버레이 투명 PNG 지원 완료
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
