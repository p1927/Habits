import type { MealPlanSyncSource } from '../lib/mealPlanQueue';
import type { UseDaySectionResult } from '../hooks/useDaySection';

export interface DaySectionProps {
  serverOnline: boolean;
  onNavigateMealPlanSyncSource?: (source: MealPlanSyncSource) => void;
  scrollToMealPlanQueue?: number;
  onAgentSchedulePrompt?: (prompt?: string) => void;
  onNavigateHome?: () => void;
}

export type DaySectionViewModel = UseDaySectionResult;

export interface DaySectionMealPlanStackProps {
  serverOnline: boolean;
  onNavigateMealPlanSyncSource?: (source: MealPlanSyncSource) => void;
  scrollToMealPlanQueue?: number;
  mealPlan: DaySectionViewModel['mealPlan'];
  habitLog: DaySectionViewModel['habitLog'];
  mealPlanShell: DaySectionViewModel['mealPlanShell'];
  metricLabel: DaySectionViewModel['metricLabel'];
  onDismissHabitQueue: DaySectionViewModel['dismissHabitQueue'];
}

export interface DaySectionScheduleStackProps {
  events: DaySectionViewModel['events'];
  habits: DaySectionViewModel['habits'];
  streaks: DaySectionViewModel['streaks'];
  manageDay: DaySectionViewModel['manageDay'];
  habitLog: DaySectionViewModel['habitLog'];
  streak: DaySectionViewModel['streak'];
  metricLabel: DaySectionViewModel['metricLabel'];
  onAgentSchedulePrompt?: (prompt?: string) => void;
  onNavigateHome?: () => void;
}

export interface DaySectionAlertsProps {
  mealSuccess: string;
  habitSyncMessage: string;
  error: string;
  streak: DaySectionViewModel['streak'];
  mealPlanUndo: DaySectionViewModel['mealPlanShell']['mealPlanUndo'];
  mealPlanUndoing: boolean;
  onMealPlanUndo: () => void;
  onDismissMealPlanUndo: () => void;
}
