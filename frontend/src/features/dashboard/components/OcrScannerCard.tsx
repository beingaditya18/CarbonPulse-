'use client';

import { useRef, ChangeEvent, KeyboardEvent, DragEvent } from 'react';
import { Camera, Loader2, Check, AlertCircle } from 'lucide-react';

interface OcrScannerCardProps {
  ocrScanStep: 'idle' | 'scanning' | 'success' | 'error';
  ocrFeedback: string;
  onReceiptUpload: (file: File) => void;
  onDemoScan: () => void;
}

/**
 * OcrScannerCard handles secure local upload dropzones and AI OCR mock simulation triggers.
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
    <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-500" />
            Receipt OCR Ingestion
          </h3>
          <p className="text-xs text-zinc-500 mt-1 font-semibold uppercase tracking-wider">
            Google Cloud Vision OCR Ingestion Pipeline
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onDemoScan}
            disabled={ocrScanStep === 'scanning'}
            className="border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 px-4 py-2 rounded-xl font-semibold text-sm transition-all cursor-pointer"
          >
            Demo OCR Scan
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
        className="border-2 border-dashed border-zinc-850 hover:border-emerald-500/50 hover:bg-zinc-950/20 transition-all p-8 rounded-xl text-center cursor-pointer"
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
          <Camera className="w-8 h-8 text-zinc-650" />
          <span className="text-sm font-bold text-zinc-300">Drag & drop files here or click to browse</span>
          <span className="text-xs text-zinc-500">Supports JPEG, PNG, WebP, PDF (Max 5MB)</span>
        </div>
      </div>

      {/* OCR SCANNER STATUS FEEDBACK BANNER */}
      {ocrScanStep !== 'idle' && (
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300 ${
          ocrScanStep === 'scanning' 
            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
            : ocrScanStep === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            {ocrScanStep === 'scanning' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : ocrScanStep === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-semibold">{ocrFeedback}</span>
          </div>
          {ocrScanStep === 'scanning' && (
            <div className="w-24 h-1 bg-zinc-800 rounded-full overflow-hidden shrink-0">
              <div className="h-full bg-blue-500 animate-pulse w-full"></div>
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
