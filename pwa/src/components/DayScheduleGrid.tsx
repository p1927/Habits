import { DayScheduleAllDayStrip } from './DayScheduleAllDayStrip';
import { DayScheduleGridBody } from './DayScheduleGridBody';
import { useDayScheduleGrid } from '../hooks/useDayScheduleGrid';
import type { DayScheduleGridProps } from '../lib/dayScheduleGridTypes';

export type { DayScheduleGridProps } from '../lib/dayScheduleGridTypes';

export function DayScheduleGrid({ events, onEventSelect }: DayScheduleGridProps) {
  const grid = useDayScheduleGrid(events);

  return (
    <div className="schedule-day-grid" aria-label="Day grid view">
      <h3 className="schedule-day-label">{grid.dayLabel}</h3>
      <DayScheduleAllDayStrip events={grid.allDay} onEventSelect={onEventSelect} />
      <DayScheduleGridBody
        scrollRef={grid.scrollRef}
        nowLineRef={grid.nowLineRef}
        slots={grid.slots}
        slotCount={grid.slotCount}
        gridStartMinutes={grid.gridStartMinutes}
        totalMinutes={grid.totalMinutes}
        showNowLine={grid.showNowLine}
        nowTopPct={grid.nowTopPct}
        now={grid.now}
        nowLineVisible={grid.nowLineVisible}
        timed={grid.timed}
        onEventSelect={onEventSelect}
        onJumpToNow={() => grid.scrollToNow()}
      />
    </div>
  );
}
