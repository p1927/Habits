import type { FoodScanResult } from './api';

export interface ScanHistoryEntry {
  id: string;
  imageUrl: string;
  scan: FoodScanResult;
  label: string;
  at: string;
}

const STORAGE_KEY = 'habits-scan-history';
const MAX_ENTRIES = 5;

function readAll(): ScanHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScanHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: ScanHistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ENTRIES)));
}

export function getScanHistory(): ScanHistoryEntry[] {
  return readAll();
}

export function addScanHistory(imageUrl: string, scan: FoodScanResult): ScanHistoryEntry {
  const label = scan.matched_name ?? scan.detected_name;
  const entry: ScanHistoryEntry = {
    id: `scan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    imageUrl,
    scan,
    label,
    at: new Date().toISOString(),
  };
  const deduped = readAll().filter(
    (item) => item.label !== label || item.scan.suggested_grams !== scan.suggested_grams,
  );
  writeAll([entry, ...deduped]);
  return entry;
}

export function clearScanHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
