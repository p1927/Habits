import { QueueEmptyHint } from './QueueEmptyHint';

export function HabitQueueEmptyHint({ announce = false }: { announce?: boolean }) {
  return (
    <QueueEmptyHint announce={announce} className="habit-queue-empty">
      No pending offline habit updates
    </QueueEmptyHint>
  );
}
