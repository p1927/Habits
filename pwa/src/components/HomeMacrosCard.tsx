import { MacroBar } from './MacroChart';
import { Card } from './ui/Card';

export interface HomeMacrosCardProps {
  protein: number;
  proteinTarget: number;
  carbs: number;
  fat: number;
}

export function HomeMacrosCard({ protein, proteinTarget, carbs, fat }: HomeMacrosCardProps) {
  return (
    <Card className="home-macros-card home-export-card--health">
      <p className="section-eyebrow">Nutrition</p>
      <h2>Macros today</h2>
      <MacroBar label="Protein" value={protein} target={proteinTarget} color="var(--ring-protein)" />
      <MacroBar label="Carbs" value={carbs} target={250} color="var(--carbs)" />
      <MacroBar label="Fat" value={fat} target={80} color="var(--fat)" />
    </Card>
  );
}
