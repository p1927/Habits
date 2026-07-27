import { HomeActivityRingsCard } from './HomeActivityRingsCard';
import { HomeMacrosCard } from './HomeMacrosCard';
import { HomeReportsPanel } from './HomeReportsPanel';
import { HomeSummaryTiles } from './HomeSummaryTiles';
import type { HomeDashboardMetricsProps } from '../lib/homeDashboardPanelsTypes';

export function HomeDashboardMetricsPanels({
  serverOnline,
  exporting,
  handleExportWeekPdf,
  dashboardLoading,
  sharingRings,
  food,
  proteinTarget,
  calTarget,
  habitPct,
  burn,
  handleShareRings,
  calorieTrend,
  habitsTrend,
}: HomeDashboardMetricsProps) {
  return (
    <>
      <HomeReportsPanel
        serverOnline={serverOnline}
        exporting={exporting}
        onExport={() => void handleExportWeekPdf()}
      />

      <HomeActivityRingsCard
        loading={dashboardLoading}
        serverOnline={serverOnline}
        sharing={sharingRings}
        protein={food?.protein_g ?? 0}
        proteinTarget={proteinTarget}
        calories={food?.calories ?? 0}
        calTarget={calTarget}
        habitsPct={habitPct}
        burn={burn}
        onShare={() => void handleShareRings()}
      />

      <HomeSummaryTiles
        loading={dashboardLoading && serverOnline}
        calories={food?.calories}
        calTarget={calTarget}
        protein={food?.protein_g}
        proteinTarget={proteinTarget}
        habitsPct={habitPct}
        calorieTrend={calorieTrend}
        habitsTrend={habitsTrend}
      />

      <HomeMacrosCard
        protein={food?.protein_g ?? 0}
        proteinTarget={proteinTarget}
        carbs={food?.carbs ?? 0}
        fat={food?.fat ?? 0}
      />
    </>
  );
}
