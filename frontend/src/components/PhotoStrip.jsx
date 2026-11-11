import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Download, RefreshCw, Printer, QrCode, Sparkles } from 'lucide-react';

/**
 * HTML5 Canvas 2x2 필름 프레임 합성 컴포넌트
 */
export default function PhotoStrip({
  frame,
  photos,
  onExportReady,
  onOpenQr,
  onOpenPrint,
}) {
  const canvasRef = useRef(null);
  const [renderedImageUrl, setRenderedImageUrl] = useState(null);
  const [customText, setCustomText] = useState(
    frame.id.includes('film') ? 'AI 인생네컷 • MEMORY' : ''
  );
  const [isRendering, setIsRendering] = useState(true);

  // 이미지 비동기 로더
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = src;
    });
  };

  // Canvas에 이미지 Cover(비율 유지 꽉 차게) 그리기
  const drawCoverImage = (ctx, img, targetX, targetY, targetW, targetH) => {
    const imgRatio = img.width / img.height;
    const targetRatio = targetW / targetH;
    let sx, sy, sw, sh;

    if (imgRatio > targetRatio) {
      sh = img.height;
      sw = img.height * targetRatio;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      sw = img.width;
      sh = img.width / targetRatio;
      sx = 0;
      sy = (img.height - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, targetX, targetY, targetW, targetH);
  };

  // 4컷 합성 렌더링 메인 함수
  const renderCanvas = useCallback(async () => {
    if (!canvasRef.current || !frame || !photos || photos.length === 0) return;
    setIsRendering(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // 캔버스 크기를 프레임 원본 해상도로 지정
    canvas.width = frame.width;
    canvas.height = frame.height;

    // 1. 배경 색상 채우기
    ctx.fillStyle = frame.theme === 'black' ? '#000000' : '#ffffff';
    ctx.fillRect(0, 0, frame.width, frame.height);

    try {
      // 2. 4장의 사진을 각 슬롯에 순서대로 렌더링
      for (let i = 0; i < frame.slots.length; i++) {
        const slot = frame.slots[i];
        const photoSrc = photos[i] || photos[0];
        if (photoSrc) {
          const img = await loadImage(photoSrc);
          drawCoverImage(ctx, img, slot.x, slot.y, slot.width, slot.height);
        }
      }

      // 3. 투명 프레임 오버레이 덮기 (필름 텍스처, 텍스트, 경계선)
      if (frame.overlay) {
        const overlayImg = await loadImage(frame.overlay);
        ctx.drawImage(overlayImg, 0, 0, frame.width, frame.height);
      }

      // 4. 하단 중앙 날짜 & 커스텀 문구 스탬프 (프레임 너비에 비례)
      if (customText && customText.trim().length > 0) {
        const now = new Date();
        const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(
          now.getDate()
        ).padStart(2, '0')}`;

        ctx.save();
        const fontSize = Math.max(10, Math.min(14, Math.floor(frame.width / 45)));
        ctx.font = `600 ${fontSize}px sans-serif`;
        ctx.fillStyle = frame.theme === 'black' ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.65)';
        ctx.textAlign = 'center';
        
        const textY = frame.height - 14;
        ctx.fillText(`${customText} | ${dateStr}`, frame.width / 2, textY);
        ctx.restore();
      }

      // 5. DataURL 추출
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      setRenderedImageUrl(dataUrl);
      if (onExportReady) onExportReady(dataUrl);

    } catch (err) {
      console.error('Canvas render error:', err);
    } finally {
      setIsRendering(false);
    }
  }, [frame, photos, customText, onExportReady]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // 로컬 다운로드 핸들러
  const handleDownload = () => {
    if (!renderedImageUrl) return;
    const a = document.createElement('a');
    a.href = renderedImageUrl;
    a.download = `photo4cut_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hidden high-res canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Preview Card: 프레임 테마에 따라 최적의 대비 배경 적용 */}
      <div
        className={`relative max-w-sm w-full p-3.5 rounded-2xl border-2 shadow-2xl flex flex-col items-center transition-colors ${
          frame.theme === 'black'
            ? 'bg-gradient-to-b from-slate-800/90 to-slate-900/90 border-slate-600/80 shadow-black/40'
            : 'bg-gradient-to-b from-slate-950 to-slate-900 border-slate-700 shadow-slate-950/60'
        }`}
      >
        {renderedImageUrl ? (
          <img
            src={renderedImageUrl}
            alt="인생네컷 최종본"
            className={`w-full h-auto rounded-lg shadow-xl object-contain transition-all ${
              frame.theme === 'black' ? 'ring-1 ring-white/20' : 'ring-1 ring-slate-700'
            }`}
          />
        ) : (
          <div className="w-full aspect-[2/3] flex items-center justify-center text-slate-400">
            <span>렌더링 중...</span>
          </div>
        )}

        {isRendering && (
          <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center backdrop-blur-sm z-10">
            <span className="text-pink-400 font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 animate-spin" />
              고해상도 4컷 합성 중...
            </span>
          </div>
        )}
      </div>

      {/* Custom Text Setting */}
      <div className="w-full max-w-md mt-4 flex items-center gap-2">
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="사진 하단 문구를 입력하세요"
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
        />
        <button
          type="button"
          onClick={renderCanvas}
          className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-semibold text-slate-200 transition"
        >
          문구 적용
        </button>
      </div>

      {/* Action Buttons: Download, QR, Print */}
      <div className="w-full max-w-md mt-6 grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={handleDownload}
          className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-white font-bold text-sm shadow flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
        >
          <Download className="w-5 h-5 text-pink-400" />
          <span>이미지 저장</span>
        </button>

        <button
          type="button"
          onClick={onOpenQr}
          className="px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl text-white font-bold text-sm shadow flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
        >
          <QrCode className="w-5 h-5 text-yellow-300" />
          <span>QR 코드 저장</span>
        </button>

        <button
          type="button"
          onClick={onOpenPrint}
          className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-white font-bold text-sm shadow flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
        >
          <Printer className="w-5 h-5 text-cyan-400" />
          <span>프린터 인쇄</span>
        </button>
      </div>
    </div>
  );
}
