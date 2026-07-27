import { useState } from 'react';
import { Card } from './ui/Card';

export interface DayManageDayCardProps {
  quadrants: Record<string, string[]>;
}

function formatQuadrantLabel(key: string): string {
  return key.replace(/_/g, ' ');
}

export function DayManageDayCard({ quadrants }: DayManageDayCardProps) {
  const [expandedQuadrant, setExpandedQuadrant] = useState<string | null>(null);

  const entries = Object.entries(quadrants).filter(([, items]) => items.length > 0);
  if (entries.length === 0) return null;

  return (
    <Card className="day-manage-card home-export-card--health">
      <p className="section-eyebrow">Planning</p>
      <h2>Manage day</h2>
      {entries.map(([quad, items]) => {
        const expanded = expandedQuadrant === quad;
        return (
          <div key={quad} className={`manage-quad ${expanded ? 'manage-quad--expanded' : ''}`}>
            <button
              type="button"
              className="manage-quad-toggle"
              aria-expanded={expanded}
              aria-controls={`manage-quad-panel-${quad}`}
              onClick={() => setExpandedQuadrant(expanded ? null : quad)}
            >
              <span className="manage-quad-toggle__label">{formatQuadrantLabel(quad)}</span>
              <span className="manage-quad-toggle__meta muted">
                {items.length} {items.length === 1 ? 'task' : 'tasks'}
              </span>
            </button>
            <div
              id={`manage-quad-panel-${quad}`}
              className="manage-quad-panel"
              hidden={!expanded}
            >
              <ul>
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            {!expanded && items.length > 0 && (
              <p className="manage-quad-preview muted">
                {items[0]}
                {items.length > 1 ? ` · +${items.length - 1} more` : ''}
              </p>
            )}
          </div>
        );
      })}
    </Card>
  );
}
