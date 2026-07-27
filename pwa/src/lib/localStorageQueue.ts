/** Shared localStorage array queue read/write/clear — used by food, habit, recipe queues. */

export interface LocalStorageQueueOps<T> {
  read: () => T[];
  write: (items: T[]) => void;
  clear: () => void;
}

export function createLocalStorageQueue<T>(storageKey: string): LocalStorageQueueOps<T> {
  function read(): T[] {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as T[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function write(items: T[]) {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }

  function clear() {
    localStorage.removeItem(storageKey);
  }

  return { read, write, clear };
}

export function makeQueueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function sortQueueByCreatedAt<T extends { created_at: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ta = new Date(a.created_at).getTime();
    const tb = new Date(b.created_at).getTime();
    if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
    if (Number.isNaN(ta)) return 1;
    if (Number.isNaN(tb)) return -1;
    return ta - tb;
  });
}
