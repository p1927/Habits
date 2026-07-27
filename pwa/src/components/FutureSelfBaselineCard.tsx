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
    <div className="future-self-card home-export-card--health ui-card ui-card--default future-self-card--hinge">
      <p className="section-eyebrow">Baseline</p>
      <h2>Baseline photo</h2>
      <CameraCapture onCapture={onCapture} disabled={generating} />
      {baselinePhoto && (
        <button
          type="button"
          className="btn-pill"
          disabled={generating || !serverOnline}
          onClick={onGenerate}
        >
          {generating ? 'Generating futures…' : 'Show decline vs accept outcomes'}
        </button>
      )}
    </div>
  );
}
