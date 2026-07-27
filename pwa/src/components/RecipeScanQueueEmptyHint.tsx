import { QueueEmptyHint } from './QueueEmptyHint';

export function RecipeScanQueueEmptyHint({ announce = false }: { announce?: boolean }) {
  return (
    <QueueEmptyHint announce={announce} className="recipe-scan-queue-empty">
      No pending offline recipe scans
    </QueueEmptyHint>
  );
}
