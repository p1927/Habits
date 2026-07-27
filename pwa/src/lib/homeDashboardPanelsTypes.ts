import type { UseHomeSectionResult } from '../hooks/useHomeSection';

export type HomeDashboardPanelsProps = Pick<
  UseHomeSectionResult,
  | 'serverOnline'
  | 'onOpenLogHistory'
  | 'onOpenLogRecipes'
  | 'exporting'
  | 'handleExportWeekPdf'
  | 'dashboardLoading'
  | 'sharingRings'
  | 'food'
  | 'proteinTarget'
  | 'calTarget'
  | 'habitPct'
  | 'burn'
  | 'handleShareRings'
  | 'calorieTrend'
  | 'habitsTrend'
  | 'setFood'
  | 'setError'
  | 'recipeLogging'
  | 'logItem'
  | 'logEntireRecipe'
  | 'recipeMessage'
  | 'mealPhotos'
  | 'history'
  | 'habitWeek'
  | 'decisionCard'
  | 'setDecisionCard'
  | 'handleAcceptCard'
>;

export type HomeDashboardMetricsProps = Pick<
  HomeDashboardPanelsProps,
  | 'serverOnline'
  | 'exporting'
  | 'handleExportWeekPdf'
  | 'dashboardLoading'
  | 'sharingRings'
  | 'food'
  | 'proteinTarget'
  | 'calTarget'
  | 'habitPct'
  | 'burn'
  | 'handleShareRings'
  | 'calorieTrend'
  | 'habitsTrend'
>;

export type HomeDashboardFeedProps = Pick<
  HomeDashboardPanelsProps,
  | 'serverOnline'
  | 'onOpenLogHistory'
  | 'onOpenLogRecipes'
  | 'setFood'
  | 'setError'
  | 'recipeLogging'
  | 'logItem'
  | 'logEntireRecipe'
  | 'recipeMessage'
  | 'mealPhotos'
  | 'history'
  | 'habitWeek'
  | 'decisionCard'
  | 'setDecisionCard'
  | 'handleAcceptCard'
>;
