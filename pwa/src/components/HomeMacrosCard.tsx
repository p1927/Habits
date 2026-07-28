import { MacroBar } from './MacroChart';
import { Card } from './ui/Card';

export interface HomeMacrosCardProps {
  protein: number;
  proteinTarget: number;
  carbs: number;
  fat: number;
  onOpenLogType?: () => void;
}

export function HomeMacrosCard({ protein, proteinTarget, carbs, fat, onOpenLogType }: HomeMacrosCardProps) {
  const content = (
    <>
      <p className="section-eyebrow">Nutrition</p>
      <h2>Macros today</h2>
      <MacroBar label="Protein" value={protein} target={proteinTarget} color="var(--ring-protein)" />
      <MacroBar label="Carbs" value={carbs} target={250} color="var(--carbs)" />
      <MacroBar label="Fat" value={fat} target={80} color="var(--fat)" />
    </>
  );

  if (!onOpenLogType) {
    return (
      <Card className="home-macros-card home-export-card--health">
        {content}
      </Card>
    );
  }

  return (
    <button
      type="button"
      className="home-trend-card-btn"
      onClick={onOpenLogType}
      aria-label="Open food log Type tab"
    >
      <Card className="home-macros-card home-export-card--health">
        {content}
        <span className="home-trend-card-hint muted">Tap to log food</span>
      </Card>
    </button>
  );
}
