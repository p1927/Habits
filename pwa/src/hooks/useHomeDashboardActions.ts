import { useCallback, useState } from 'react';
import {
  api,
  type FoodTodayResponse,
  type FutureSelfCard,
  type HabitsTodayResponse,
} from '../lib/api';
import { cacheHabitStreak, getCachedHabitStreak } from '../lib/habitQueue';
import type { RingShareData } from '../lib/ringShareCard';

interface UseHomeDashboardActionsOptions {
  serverOnline: boolean;
  food: FoodTodayResponse | null;
  habits: HabitsTodayResponse | null;
  proteinTarget: number;
  calTarget: number;
  habitPct: number;
  decisionCard: FutureSelfCard | null;
  setDecisionCard: (card: FutureSelfCard | null) => void;
  setError: (msg: string) => void;
  setExporting: (exporting: boolean) => void;
  setSharingRings: (sharing: boolean) => void;
  onRefresh: () => Promise<void>;
}

export function useHomeDashboardActions({
  serverOnline,
  food,
  habits,
  proteinTarget,
  calTarget,
  habitPct,
  decisionCard,
  setDecisionCard,
  setError,
  setExporting,
  setSharingRings,
  onRefresh,
}: UseHomeDashboardActionsOptions) {
  const [ringSharePreviewUrl, setRingSharePreviewUrl] = useState<string | null>(null);
  const [ringShareDownloadData, setRingShareDownloadData] = useState<RingShareData | null>(null);

  const closeRingShareSheet = useCallback(() => {
    setRingSharePreviewUrl(null);
    setRingShareDownloadData(null);
  }, []);

  const downloadRingShareFromSheet = useCallback(async () => {
    if (!ringShareDownloadData) return;
    const { downloadRingShareCard } = await import('../lib/ringShareCard');
    downloadRingShareCard(ringShareDownloadData);
  }, [ringShareDownloadData]);

  const handleShareRings = useCallback(async () => {
    setSharingRings(true);
    setError('');
    try {
      let streakDays = getCachedHabitStreak();
      if (serverOnline) {
        try {
          const st = await api.getHabitStreaks();
          streakDays = st.overall;
          cacheHabitStreak(st.overall);
        } catch {
          /* use cached streak when fetch fails */
        }
      }
      const shareData: RingShareData = {
        protein: { value: food?.protein_g ?? 0, max: proteinTarget },
        calories: { value: food?.calories ?? 0, max: calTarget },
        habits: { value: habitPct, max: 100 },
        date: habits?.date || new Date().toISOString().slice(0, 10),
        streakDays,
      };
      const { createRingShareCanvas } = await import('../lib/ringShareCard');
      const canvas = createRingShareCanvas(shareData);
      setRingShareDownloadData(shareData);
      setRingSharePreviewUrl(canvas.toDataURL('image/png'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Share card export failed');
    } finally {
      setSharingRings(false);
    }
  }, [serverOnline, food, proteinTarget, calTarget, habitPct, habits?.date, setError, setSharingRings]);

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
  }, [serverOnline, setError, setExporting]);

  const handleAcceptCard = useCallback(async () => {
    if (!decisionCard) return;
    try {
      await api.acceptFutureSelfCard(decisionCard.id);
      setDecisionCard(null);
      await onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Accept failed');
    }
  }, [decisionCard, setDecisionCard, setError, onRefresh]);

  return {
    handleShareRings,
    handleExportWeekPdf,
    handleAcceptCard,
    ringSharePreviewUrl,
    closeRingShareSheet,
    downloadRingShareFromSheet,
  };
}
