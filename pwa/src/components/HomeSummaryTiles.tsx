import { Sparkline } from './MacroChart';

interface HomeSummaryTilesProps {
  loading?: boolean;
  calories?: number;
  calTarget: number;
  protein?: number;
  proteinTarget: number;
  habitsPct: number;
  calorieTrend?: number[];
  habitsTrend?: number[];
}

function SummaryTileSkeleton() {
  return (
    <div className="home-summary-tile home-summary-tile--skeleton" aria-hidden="true">
      <div className="home-summary-skeleton-line home-summary-skeleton-line--short" />
      <div className="home-summary-skeleton-line home-summary-skeleton-line--tall" />
    </div>
  );
}

export function HomeSummaryTiles({
  loading = false,
  calories = 0,
  calTarget,
  protein = 0,
  proteinTarget,
  habitsPct,
  calorieTrend,
  habitsTrend,
}: HomeSummaryTilesProps) {
  if (loading) {
    return (
      <div className="home-summary-grid" aria-busy="true" aria-label="Loading summary">
        <SummaryTileSkeleton />
        <SummaryTileSkeleton />
        <SummaryTileSkeleton />
      </div>
    );
  }

  const calPct = calTarget > 0 ? Math.round((calories / calTarget) * 100) : 0;
  const proteinPct = proteinTarget > 0 ? Math.round((protein / proteinTarget) * 100) : 0;

  return (
    <div className="home-summary-grid" role="group" aria-label="Today at a glance">
      <article className="home-summary-tile home-summary-tile--calories">
        <p className="home-summary-label">Calories</p>
        <p className="home-summary-value">{Math.round(calories)}</p>
        <p className="home-summary-sub">{calPct}% of {calTarget}</p>
        {calorieTrend && calorieTrend.length > 1 && (
          <Sparkline data={calorieTrend} color="var(--ring-calories)" height={28} />
        )}
      </article>
      <article className="home-summary-tile home-summary-tile--protein">
        <p className="home-summary-label">Protein</p>
        <p className="home-summary-value">{Math.round(protein)}g</p>
        <p className="home-summary-sub">{proteinPct}% of {proteinTarget}g</p>
      </article>
      <article className="home-summary-tile home-summary-tile--habits">
        <p className="home-summary-label">Habits</p>
        <p className="home-summary-value">{habitsPct}%</p>
        <p className="home-summary-sub">daily targets</p>
        {habitsTrend && habitsTrend.length > 1 && (
          <Sparkline data={habitsTrend} color="var(--ring-habits)" height={28} />
        )}
      </article>
    </div>
  );
}
