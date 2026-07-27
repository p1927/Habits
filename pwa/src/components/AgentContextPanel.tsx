import type { CSSProperties } from 'react';
import type { AgentContextState } from '../hooks/useAgentContext';
import { MealPlanSyncAwarenessSlot } from './MealPlanSyncAwarenessSlot';
import type { MealPlanSyncSource } from '../lib/mealPlanQueue';

interface AgentContextPanelProps {
  context: AgentContextState;
  onNavigateMealPlanSyncSource?: (source: MealPlanSyncSource) => void;
}

const HABIT_LABELS: Record<string, string> = {
  sleep: 'Sleep',
  work: 'Work',
  wasted: 'Wasted',
  speak: 'Speak',
  game: 'Game',
  read: 'Read',
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export function AgentContextPanel({ context, onNavigateMealPlanSyncSource }: AgentContextPanelProps) {
  const { food, habits, calendar, summary, loading, error } = context;

  if (loading && !food) {
    return <div className="agent-context agent-context-loading muted">Loading daily context…</div>;
  }

  if (error && !food) {
    return <div className="agent-context banner banner-warn">{error}</div>;
  }

  const protein = food?.protein_g ?? 0;
  const target = food?.protein_target_g ?? 150;
  const pct = target > 0 ? Math.min(100, Math.round((protein / target) * 100)) : 0;

  const metrics = habits?.metrics ?? {};
  const habitEntries = Object.entries(metrics).filter(([, v]) => v != null && v > 0);

  return (
    <div className="agent-context">
      <MealPlanSyncAwarenessSlot
        viewer="external"
        onNavigate={onNavigateMealPlanSyncSource}
        showPendingWhenIdle
      />

      <div className="agent-context-row">
        <div className="agent-protein-ring" style={{ '--pct': `${pct}%` } as CSSProperties}>
          <div className="agent-protein-ring-inner">
            <span className="agent-protein-value">{Math.round(protein)}g</span>
            <span className="agent-protein-label">protein</span>
          </div>
        </div>
        <div className="agent-context-stats">
          <div className="agent-stat">
            <span className="agent-stat-value">{target ? `${Math.round(protein)}/${target}g` : '—'}</span>
            <span className="agent-stat-label">Protein target</span>
          </div>
          <div className="agent-stat">
            <span className="agent-stat-value">{food ? Math.round(food.calories) : '—'}</span>
            <span className="agent-stat-label">Calories</span>
          </div>
          <div className="agent-stat">
            <span className="agent-stat-value">{food?.items.length ?? 0}</span>
            <span className="agent-stat-label">Meals logged</span>
          </div>
        </div>
      </div>

      {habitEntries.length > 0 && (
        <div className="agent-habit-chips">
          {habitEntries.map(([key, val]) => (
            <span key={key} className="agent-habit-chip">
              {HABIT_LABELS[key] ?? key} {val}h
            </span>
          ))}
        </div>
      )}

      {calendar.length > 0 && (
        <ul className="agent-events">
          {calendar.slice(0, 4).map((ev) => (
            <li key={ev.id}>
              <span className="agent-event-time">{formatTime(ev.start)}</span>
              <span className="agent-event-title">{ev.summary}</span>
            </li>
          ))}
        </ul>
      )}

      {summary && <p className="agent-summary-snippet">{summary}</p>}
    </div>
  );
}
