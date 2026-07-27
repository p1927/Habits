import { CameraCapture } from './CameraCapture';

interface FutureSelfBaselineCardProps {
  baselinePhoto: string | null;
  generating: boolean;
  serverOnline: boolean;
  onCapture: (dataUrl: string) => void;
  onGenerate: () => void;
}

export function FutureSelfBaselineCard({
  baselinePhoto,
  generating,
  serverOnline,
  onCapture,
  onGenerate,
}: FutureSelfBaselineCardProps) {
  return (
    <div className="card">
      <h2>Baseline photo</h2>
      <CameraCapture onCapture={onCapture} disabled={generating} />
      {baselinePhoto && (
        <button type="button" disabled={generating || !serverOnline} onClick={onGenerate}>
          {generating ? 'Generating futures…' : 'Show decline vs accept outcomes'}
        </button>
      )}
    </div>
  );
}
