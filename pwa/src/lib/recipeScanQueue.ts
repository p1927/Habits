import { createLocalStorageQueue, makeQueueId, sortQueueByCreatedAt } from './localStorageQueue';

const STORAGE_KEY = 'habits-recipe-scan-queue';
const queue = createLocalStorageQueue<QueuedRecipeScan>(STORAGE_KEY);

export interface QueuedRecipeScan {
  id: string;
  photoId: string;
  label: string;
  created_at: string;
}

export function getRecipeScanQueue(): QueuedRecipeScan[] {
  return sortQueueByCreatedAt(queue.read());
}

export function enqueueRecipeScan(photoId: string, label: string, id?: string): QueuedRecipeScan {
  const item: QueuedRecipeScan = {
    id: id ?? makeQueueId('rsq'),
    photoId,
    label: label.trim() || 'Recipe',
    created_at: new Date().toISOString(),
  };
  queue.write([...queue.read(), item]);
  return item;
}

export function removeRecipeScanQueueItem(id: string) {
  queue.write(queue.read().filter((x) => x.id !== id));
}

export function clearRecipeScanQueue() {
  queue.clear();
}
