import { ActivityRings, ActivityRingsSkeleton } from './ui/Ring';
import { Card } from './ui/Card';

export interface HomeActivityRingsCardProps {
  loading: boolean;
  serverOnline: boolean;
  sharing: boolean;
  protein: number;
  proteinTarget: number;
  calories: number;
  calTarget: number;
  habitsPct: number;
  burn: number;
  onShare: () => void;
}

export function HomeActivityRingsCard({
  loading,
  serverOnline,
  sharing,
  protein,
  proteinTarget,
  calories,
  calTarget,
  habitsPct,
  burn,
  onShare,
}: HomeActivityRingsCardProps) {
  return (
    <Card className="home-rings-card home-rings-card--health">
      <p className="section-eyebrow">Summary</p>
      <div className="home-export-row">
        <h2>Activity</h2>
        <button
          type="button"
          className="btn-small"
          disabled={sharing || loading}
          onClick={onShare}
        >
          {sharing ? 'Saving…' : 'Share PNG'}
        </button>
      </div>
      {loading && serverOnline ? (
        <ActivityRingsSkeleton />
      ) : (
        <ActivityRings
          protein={{ value: protein, max: proteinTarget }}
          calories={{ value: calories, max: calTarget }}
          habits={{ value: habitsPct, max: 100 }}
        />
      )}
      <p className="home-burn muted">Est. active burn: {burn} kcal (from work + read hours)</p>
    </Card>
  );
}
