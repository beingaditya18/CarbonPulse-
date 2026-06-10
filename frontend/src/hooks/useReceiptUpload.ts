import { useState } from 'react';
import { useCarbonStore } from '@/store/useCarbonStore';

/**
 * Custom React hook managing receipt OCR file uploading and scanning states.
 */
export function useReceiptUpload() {
  const { addLog } = useCarbonStore();
  const [ocrScanStep, setOcrScanStep] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [ocrFeedback, setOcrFeedback] = useState('');

  const handleReceiptUpload = async (file: File) => {
    setOcrScanStep('scanning');
    setOcrFeedback('Uploading receipt to secure GCS bucket...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/carbon/receipt', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.json().catch(() => ({}));
        throw new Error(errorText.detail || 'Vision API processing failure.');
      }

      const parsedResult = await res.json();
      
      const logged = addLog({
        category: parsedResult.category,
        emission_amount: parsedResult.emission_amount,
        source: 'ocr',
        description: parsedResult.description || 'Receipt Scan Activity',
      });

      setOcrScanStep('success');
      setOcrFeedback(`OCR Successful! Logged ${logged.emission_amount} kg CO₂ into ${logged.category}.`);
      
      setTimeout(() => setOcrScanStep('idle'), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setOcrScanStep('error');
      setOcrFeedback(`Error: ${msg}`);
      setTimeout(() => setOcrScanStep('idle'), 4000);
    }
  };

  const handleDemoScan = async () => {
    setOcrScanStep('scanning');
    setOcrFeedback('Triggering OCR sandbox pipelines...');

    try {
      const demoFormData = new FormData();
      const blob = new Blob(['mock-data'], { type: 'image/png' });
      const file = new File([blob], 'gas_station_invoice.png', { type: 'image/png' });
      demoFormData.append('file', file);

      const res = await fetch('/api/carbon/receipt', {
        method: 'POST',
        body: demoFormData,
      });

      if (!res.ok) throw new Error('Demo endpoint failed.');

      const parsedResult = await res.json();
      
      const logged = addLog({
        category: parsedResult.category,
        emission_amount: parsedResult.emission_amount,
        source: 'ocr',
        description: parsedResult.description || 'Whole Foods Organic Receipt',
      });

      setOcrScanStep('success');
      setOcrFeedback(`OCR Sandbox Success! Logged ${logged.emission_amount} kg CO₂ into ${logged.category}.`);
      setTimeout(() => setOcrScanStep('idle'), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Demo run failed';
      setOcrScanStep('error');
      setOcrFeedback(`Error: ${msg}`);
      setTimeout(() => setOcrScanStep('idle'), 4000);
    }
  };

  return {
    ocrScanStep,
    ocrFeedback,
    handleReceiptUpload,
    handleDemoScan,
  };
}
