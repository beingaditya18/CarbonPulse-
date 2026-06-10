import { LandingTwinPreview } from '@/features/landing/components/LandingTwinPreview';

interface PreviewSimulatorProps {
  isDark: boolean;
}

/**
 * PreviewSimulator wrapper for the interactive landing digital twin.
 */
export function PreviewSimulator({ isDark }: PreviewSimulatorProps) {
  return (
    <div id="twin-preview" className="lg:col-span-5">
      <LandingTwinPreview isDark={isDark} />
    </div>
  );
}
