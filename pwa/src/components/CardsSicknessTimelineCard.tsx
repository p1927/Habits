import { Card } from './ui/Card';
import { SicknessTimeline } from './SicknessTimeline';
import type { SicknessTimelineEvent } from '../lib/api';

interface CardsSicknessTimelineCardProps {
  events: SicknessTimelineEvent[];
}

export function CardsSicknessTimelineCard({ events }: CardsSicknessTimelineCardProps) {
  return (
    <Card variant="keep-yellow">
      <h2>Sickness timeline</h2>
      <p className="muted">Last 90 days from Nutrition sheet</p>
      <SicknessTimeline events={events} />
    </Card>
  );
}
