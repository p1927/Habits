import { Card } from './ui/Card';
import { SicknessTimeline } from './SicknessTimeline';
import type { SicknessTimelineEvent } from '../lib/api';

interface CardsSicknessTimelineCardProps {
  events: SicknessTimelineEvent[];
  /**
   * ui-072 / crit-081 — when a sickness event is activated, jump to the
   * matching notes filter. Forwarded to SicknessTimeline.
   */
  onEventSelect?: (event: SicknessTimelineEvent) => void;
}

export function CardsSicknessTimelineCard({ events, onEventSelect }: CardsSicknessTimelineCardProps) {
  return (
    <Card variant="keep-yellow">
      <h2>Sickness timeline</h2>
      <p className="muted">Last 90 days from Nutrition sheet</p>
      <SicknessTimeline events={events} onEventSelect={onEventSelect} />
    </Card>
  );
}
