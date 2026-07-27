import { useCallback, useState } from 'react';
import { api } from '../lib/api';

export function useDayWeekReportExport(serverOnline: boolean, setError: (msg: string) => void) {
  const [exporting, setExporting] = useState(false);

  const handleExportWeekPdf = useCallback(async () => {
    if (!serverOnline) return;
    setExporting(true);
    setError('');
    try {
      const [hist, week, streaks, targets] = await Promise.all([
        api.getFoodHistory(7),
        api.getHabitsWeek(),
        api.getHabitStreaks(),
        api.getFoodTargets(),
      ]);
      const { downloadWeekReportPdf } = await import('../lib/weekReportPdf');
      downloadWeekReportPdf({
        foodDays: hist.days,
        habitWeek: week,
        streaks,
        calorieTarget: targets.calorie_target ?? 2200,
        proteinTarget: targets.protein_target_g ?? 150,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'PDF export failed');
    } finally {
      setExporting(false);
    }
  }, [serverOnline, setError]);

  return { exporting, handleExportWeekPdf };
}
