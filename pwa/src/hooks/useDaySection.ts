import { useState } from 'react';
import { useDaySectionData } from './useDaySectionData';
import { useDayStreakHaptics } from './useDayStreakHaptics';
import { useDayWeekReportExport } from './useDayWeekReportExport';
import { useMealPlanShell } from './useMealPlanShell';
import { useOptimisticHabitLog } from './useOptimisticHabitLog';
import { dayMetricLabel } from '../lib/daySectionShared';
import type { MealPlanSyncSource } from '../lib/mealPlanQueue';

interface UseDaySectionOptions {
  serverOnline: boolean;
  onNavigateMealPlanSyncSource?: (source: MealPlanSyncSource) => void;
  scrollToMealPlanQueue?: number;
}

export function useDaySection({
  serverOnline,
}: Pick<UseDaySectionOptions, 'serverOnline'>) {
  const [mealSuccess, setMealSuccess] = useState('');
  const [habitSyncMessage, setHabitSyncMessage] = useState('');

  const sectionData = useDaySectionData(serverOnline);
  const { habits, setHabits, events, manageDay, mealPlan, streaks, error, setError } = sectionData;

  const streak = useDayStreakHaptics(streaks);
  const weekReport = useDayWeekReportExport(serverOnline, setError);

  const habitLog = useOptimisticHabitLog({
    serverOnline,
    habits,
    setHabits,
    setError,
    setSyncMessage: setHabitSyncMessage,
  });

  const mealPlanShell = useMealPlanShell({
    serverOnline,
    syncSource: 'day',
    setMessage: setMealSuccess,
    setError,
  });

  const dismissHabitQueue = () => {
    habitLog.dismissAllQueued();
    setHabitSyncMessage('Offline habit update queue cleared');
  };

  const handleMealPlanUndoSuccess = () => setMealSuccess('Log undone');

  return {
    mealSuccess,
    habitSyncMessage,
    habits,
    streaks,
    events,
    manageDay,
    mealPlan,
    error,
    metricLabel: dayMetricLabel,
    streak,
    habitLog,
    mealPlanShell,
    dismissHabitQueue,
    handleMealPlanUndoSuccess,
    exportingWeekPdf: weekReport.exporting,
    handleExportWeekPdf: weekReport.handleExportWeekPdf,
  };
}

export type UseDaySectionResult = ReturnType<typeof useDaySection>;
