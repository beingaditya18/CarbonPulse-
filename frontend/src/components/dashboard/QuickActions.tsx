import { OcrScannerCard } from '@/features/dashboard/components/OcrScannerCard';

interface QuickActionsProps {
  ocrScanStep: 'idle' | 'scanning' | 'success' | 'error';
  ocrFeedback: string;
  onReceiptUpload: (file: File) => Promise<void>;
  onDemoScan: () => Promise<void>;
}

/**
 * QuickActions component hosting the AI OCR receipt dropzone triggers and sandbox hooks.
 */
export function QuickActions({
  ocrScanStep,
  ocrFeedback,
  onReceiptUpload,
  onDemoScan,
}: QuickActionsProps) {
  return (
    <OcrScannerCard
      ocrScanStep={ocrScanStep}
      ocrFeedback={ocrFeedback}
      onReceiptUpload={onReceiptUpload}
      onDemoScan={onDemoScan}
    />
  );
}
