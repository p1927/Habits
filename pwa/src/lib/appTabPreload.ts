import { lazy } from 'react';
import type { TabId } from './config';

export const Log = lazy(async () => ({ default: (await import('../sections/Log')).Log }));
export const Day = lazy(async () => ({ default: (await import('../sections/Day')).Day }));
export const Cards = lazy(async () => ({ default: (await import('../sections/Cards')).Cards }));
export const Agent = lazy(async () => ({ default: (await import('../sections/Agent')).Agent }));
export const Settings = lazy(async () => ({ default: (await import('../sections/Settings')).Settings }));

const TAB_CHUNK_PRELOAD: Partial<Record<TabId, () => Promise<unknown>>> = {
  log: () => import('../sections/Log'),
  day: () => import('../sections/Day'),
  cards: () => import('../sections/Cards'),
  agent: () => import('../sections/Agent'),
  settings: () => import('../sections/Settings'),
};

const preloadedTabs = new Set<TabId>();

export function preloadAppTabChunk(id: TabId) {
  if (preloadedTabs.has(id)) return;
  const load = TAB_CHUNK_PRELOAD[id];
  if (!load) return;
  preloadedTabs.add(id);
  void load();
}
