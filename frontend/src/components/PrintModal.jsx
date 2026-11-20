import React, { useState } from 'react';
import { X, Printer, Check, Settings2, FileText } from 'lucide-react';

export default function PrintModal({ isOpen, onClose, imageDataUrl, frameName }) {
  const [copies, setCopies] = useState(1);
  const [paperSize, setPaperSize] = useState('4x6'); // 4x6 inch, a4

  if (!isOpen || !imageDataUrl) return null;

  const handlePrint = () => {
    // 인쇄 전용 iframe 또는 window.print 트리거
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>AI 인생네컷 인쇄</title>
          <style>
            @page {
              size: ${paperSize === '4x6' ? '4in 6in' : 'A4'};
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background-color: #ffffff;
            }
            .print-container {
              width: 100%;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              page-break-after: always;
            }
            img {
              max-width: ${paperSize === '4x6' ? '100%' : '96%'};
              max-height: ${paperSize === '4x6' ? '100vh' : '96vh'};
              object-fit: contain;
              box-shadow: none;
            }
          </style>
        </head>
        <body>
          ${Array.from({ length: copies })
            .map(
              () => `
            <div class="print-container">
              <img src="${imageDataUrl}" />
            </div>
          `
            )
            .join('')}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/45 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white border border-stone-200 rounded-3xl p-6 shadow-2xl text-left">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 rounded-full bg-stone-100 hover:bg-stone-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Printer className="w-5 h-5 text-stone-800" />
          <h3 className="text-lg font-extrabold text-stone-900">포토 프린터 인쇄</h3>
        </div>
        <p className="text-xs text-stone-500 mb-5">
          연결된 포토 프린터나 일반 프린터로 인생네컷을 인쇄합니다.
        </p>

        {/* Preview & Options Grid */}
        <div className="flex gap-4 mb-6">
          <div className="w-24 aspect-[2/3] bg-[#FAF8F5] rounded-xl overflow-hidden border border-stone-200 flex-shrink-0 flex items-center justify-center p-1">
            <img src={imageDataUrl} alt="인쇄 미리보기" className="w-full h-full object-contain rounded-lg" />
          </div>

          <div className="flex-1 space-y-3.5">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">인쇄 용지 규격</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaperSize('4x6')}
                  className={`py-2 px-2 text-xs rounded-xl font-bold border transition ${
                    paperSize === '4x6'
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-200 bg-[#FAF8F5] text-stone-600 hover:border-stone-300'
                  }`}
                >
                  4×6 인치 (포토용지)
                </button>
                <button
                  type="button"
                  onClick={() => setPaperSize('a4')}
                  className={`py-2 px-2 text-xs rounded-xl font-bold border transition ${
                    paperSize === 'a4'
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-200 bg-[#FAF8F5] text-stone-600 hover:border-stone-300'
                  }`}
                >
                  A4 용지
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">출력 매수</label>
              <div className="flex items-center gap-2">
                {[1, 2, 4].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setCopies(cnt)}
                    className={`py-1.5 px-3.5 text-xs rounded-xl font-bold border transition ${
                      copies === cnt
                        ? 'border-rose-600 bg-rose-50 text-rose-700'
                        : 'border-stone-200 bg-[#FAF8F5] text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {cnt}장
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handlePrint}
          className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
        >
          <Printer className="w-4 h-4 text-rose-400" />
          <span>프린터로 지금 바로 인쇄하기 ({copies}장)</span>
        </button>
      </div>
    </div>
  );
}
