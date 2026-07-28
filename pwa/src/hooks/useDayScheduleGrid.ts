import { useCallback, useEffect, useRef, useState } from 'react';
import type { DayCalendarEvent } from '../lib/daySectionShared';
import {
  DAY_GRID_END_HOUR,
  DAY_GRID_SLOT_MINUTES,
  DAY_GRID_START_HOUR,
  dayGridSlotCount,
  formatGridTimeLabel,
  formatScheduleDayLabel,
  partitionCalendarEvents,
} from '../lib/daySectionShared';
import type { DayScheduleGridSlot } from '../lib/dayScheduleGridTypes';

export function useDayScheduleGrid(events: DayCalendarEvent[]) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const nowLineRef = useRef<HTMLDivElement>(null);
  const [nowLineVisible, setNowLineVisible] = useState(true);
  const { allDay, timed } = partitionCalendarEvents(events);
  const slotCount = dayGridSlotCount();
  const gridStartMinutes = DAY_GRID_START_HOUR * 60;
  const gridEndMinutes = DAY_GRID_END_HOUR * 60;
  const totalMinutes = gridEndMinutes - gridStartMinutes;
  const dayLabel = formatScheduleDayLabel();

  const slots: DayScheduleGridSlot[] = Array.from({ length: slotCount + 1 }, (_, index) => {
    const minutes = gridStartMinutes + index * DAY_GRID_SLOT_MINUTES;
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    return { hour, minute, label: minute === 0 ? formatGridTimeLabel(hour, 0) : '' };
  });

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const showNowLine = nowMinutes >= gridStartMinutes && nowMinutes <= gridEndMinutes;
  const nowTopPct = showNowLine ? ((nowMinutes - gridStartMinutes) / totalMinutes) * 100 : 0;

  const scrollToNow = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    const gridBody = scrollEl.querySelector('.schedule-grid-body');
    const gridHeight = gridBody instanceof HTMLElement ? gridBody.offsetHeight : scrollEl.scrollHeight;
    const nowPixelTop = (nowTopPct / 100) * gridHeight;
    scrollEl.scrollTo({ top: Math.max(0, nowPixelTop - scrollEl.clientHeight * 0.35), behavior });
  }, [nowTopPct]);

  useEffect(() => {
    if (!showNowLine) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scrollToNow(reducedMotion ? 'auto' : 'smooth');
  }, [showNowLine, scrollToNow]);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    const nowEl = nowLineRef.current;
    if (!showNowLine || !scrollEl || !nowEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => setNowLineVisible(entry?.isIntersecting ?? false),
      { root: scrollEl, threshold: 0.15 },
    );
    observer.observe(nowEl);
    return () => observer.disconnect();
  }, [showNowLine]);

  return {
    scrollRef,
    nowLineRef,
    nowLineVisible,
    scrollToNow,
    allDay,
    timed,
    dayLabel,
    slots,
    slotCount,
    gridStartMinutes,
    totalMinutes,
    showNowLine,
    nowTopPct,
    now,
  };
}
