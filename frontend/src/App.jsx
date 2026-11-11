import React from 'react';
import { Camera, Sparkles } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold flex items-center justify-center gap-2 mb-2">
          <Camera className="w-8 h-8 text-pink-400" />
          AI 인생네컷 부스
          <Sparkles className="w-8 h-8 text-yellow-300" />
        </h1>
        <p className="text-slate-400">웹캠 다회차 자동 캡처 & AI 스타일 변환 4컷 포토부스</p>
      </header>

      <main className="w-full max-w-4xl bg-slate-800/80 rounded-2xl p-6 shadow-xl border border-slate-700 text-center">
        <p className="text-slate-300">프로젝트 환경 설정이 완료되었습니다. 곧 구현이 시작됩니다.</p>
      </main>
    </div>
  );
}

export default App;
