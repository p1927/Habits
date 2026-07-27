interface DayScheduleEmptyPanelProps {
  onAgentSchedulePrompt?: () => void;
}

export function DayScheduleEmptyPanel({ onAgentSchedulePrompt }: DayScheduleEmptyPanelProps) {
  return (
    <div className="day-schedule-empty-panel">
      <p className="section-eyebrow">Today</p>
      <p className="day-schedule-empty-panel__title">Nothing scheduled</p>
      <p className="muted day-schedule-empty-panel__body">Your day is clear — add events or ask Coach to plan.</p>
      {onAgentSchedulePrompt && (
        <button
          type="button"
          className="btn-pill btn-pill-outline day-schedule-empty__cta"
          onClick={onAgentSchedulePrompt}
        >
          Add with Coach
        </button>
      )}
    </div>
  );
}
