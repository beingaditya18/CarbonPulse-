'use client';

import { useRef, ChangeEvent, KeyboardEvent, DragEvent } from 'react';
import { Camera, Loader2, Check, AlertCircle, UploadCloud } from 'lucide-react';

interface OcrScannerCardProps {
  ocrScanStep: 'idle' | 'scanning' | 'success' | 'error';
  ocrFeedback: string;
  onReceiptUpload: (file: File) => void;
  onDemoScan: () => void;
}

/**
 * OcrScannerCard handles secure local upload dropzones and AI OCR receipt parsing.
 * Formatted for environmental standard white & green web aesthetic.
 */
export function OcrScannerCard({
  ocrScanStep,
  ocrFeedback,
  onReceiptUpload,
  onDemoScan,
}: OcrScannerCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Type validation (including PDF)
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) {
      alert('Only JPEG, PNG, WebP, and PDF files are supported.');
      return;
    }

    // Size check (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB security limit.');
      return;
    }

    onReceiptUpload(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) {
      alert('Only JPEG, PNG, WebP, and PDF files are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB security limit.');
      return;
    }

    onReceiptUpload(file);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerFileSelect();
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 p-6 rounded-2xl space-y-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 text-[#047857] rounded-lg">
              <Camera className="w-4 h-4" />
            </span>
            Utility Bill & Receipt Ingestion
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider">
            Google Cloud Vision OCR • Energy Star Activity Parser
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onDemoScan}
            disabled={ocrScanStep === 'scanning'}
            className="border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100 text-[#047857] px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-2xs"
          >
            Demo Scan (Electric Bill)
          </button>
        </div>
      </div>

      {/* DRAG AND DROP ZONE */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload receipt or utility bill. Accepted formats: JPEG, PNG, WebP, PDF. Maximum size: 5MB."
        aria-describedby="upload-instructions"
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={triggerFileSelect}
        className="border-2 border-dashed border-emerald-200/90 hover:border-[#047857] bg-emerald-50/20 hover:bg-emerald-50/50 transition-all p-7 rounded-2xl text-center cursor-pointer group"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          aria-hidden="true"
          tabIndex={-1}
          onChange={handleFileChange}
          className="sr-only"
          disabled={ocrScanStep === 'scanning'}
        />
        <p id="upload-instructions" className="sr-only">
          Drag and drop a receipt file here, or press Enter to open the file picker. Supported formats are JPEG, PNG, WebP, and PDF files up to 5 megabytes.
        </p>
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#047857] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
            <UploadCloud className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span className="text-sm font-bold text-slate-800">
            Drag & drop receipts, utility bills, or click to browse
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Accepted formats: JPEG, PNG, WebP, PDF (Max 5MB)
          </span>
        </div>
      </div>

      {/* OCR SCANNER STATUS FEEDBACK BANNER */}
      {ocrScanStep !== 'idle' && (
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300 ${ocrScanStep === 'scanning'
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : ocrScanStep === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}>
          <div className="flex items-center gap-2">
            {ocrScanStep === 'scanning' ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            ) : ocrScanStep === 'success' ? (
              <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="text-xs sm:text-sm font-bold">{ocrFeedback}</span>
          </div>
          {ocrScanStep === 'scanning' && (
            <div className="w-24 h-1.5 bg-blue-200 rounded-full overflow-hidden shrink-0">
              <div className="h-full bg-blue-600 animate-pulse w-full"></div>
            </div>
          )}
        </div>
      )}

      {/* Screen Reader Alert Error State */}
      {ocrScanStep === 'error' && (
        <p
          role="alert"
          aria-live="assertive"
          id="upload-error"
          className="sr-only"
        >
          {ocrFeedback}
        </p>
      )}
    </div>
  );
}
