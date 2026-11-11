import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Smartphone, Download, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function QrModal({ isOpen, onClose, imageDataUrl }) {
  const [downloadUrl, setDownloadUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !imageDataUrl) return;

    let isMounted = true;
    setLoading(true);

    // 백엔드에 이미지 공유 요청
    axios
      .post('/api/v1/photos/share', { image: imageDataUrl })
      .then((res) => {
        if (!isMounted) return;
        const url = res.data.downloadUrl || `${window.location.origin}${res.data.downloadPath}`;
        setDownloadUrl(url);
      })
      .catch((err) => {
        console.warn('Share API fallback to local data url:', err);
        // Fallback: 현재 윈도우 URL 또는 dataUrl
        if (!isMounted) return;
        setDownloadUrl(window.location.href);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, imageDataUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!downloadUrl) return;
    navigator.clipboard.writeText(downloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Smartphone className="w-6 h-6 text-pink-400" />
          <h3 className="text-xl font-bold text-white">스마트폰으로 사진 저장</h3>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          기본 카메라 앱으로 아래 QR 코드를 스캔하면 고해상도 인생네컷 원본을 바로 다운로드할 수 있습니다.
        </p>

        {/* QR Code Container */}
        <div className="w-56 h-56 mx-auto bg-white p-4 rounded-2xl shadow-lg flex items-center justify-center mb-6">
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-slate-600">
              <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
              <span className="text-xs font-semibold">QR 코드 생성 중...</span>
            </div>
          ) : downloadUrl ? (
            <QRCodeSVG
              value={downloadUrl}
              size={192}
              level="H"
              includeMargin={false}
              className="w-full h-full"
            />
          ) : (
            <span className="text-xs text-rose-500">QR 생성 실패</span>
          )}
        </div>

        {/* Link Copy & Actions */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>다운로드 링크 복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>다운로드 링크 주소 복사</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-xl transition shadow-lg"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
}
