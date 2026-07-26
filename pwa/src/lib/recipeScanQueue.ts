const STORAGE_KEY = 'habits-recipe-scan-queue';

export interface QueuedRecipeScan {
  id: string;
  photoId: string;
  label: string;
  created_at: string;
}

function readQueue(): QueuedRecipeScan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueuedRecipeScan[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(items: QueuedRecipeScan[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getRecipeScanQueue(): QueuedRecipeScan[] {
  return readQueue();
}

export function enqueueRecipeScan(photoId: string, label: string, id?: string): QueuedRecipeScan {
  const item: QueuedRecipeScan = {
    id: id ?? `rsq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    photoId,
    label: label.trim() || 'Recipe',
    created_at: new Date().toISOString(),
  };
  writeQueue([...readQueue(), item]);
  return item;
}

export function removeRecipeScanQueueItem(id: string) {
  writeQueue(readQueue().filter((x) => x.id !== id));
}

export function clearRecipeScanQueue() {
  localStorage.removeItem(STORAGE_KEY);
}
