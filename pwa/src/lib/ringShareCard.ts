export type { RingShareData } from './ringShareCardTypes';
export { createRingShareCanvas, downloadCanvasBlob, formatShareDate, renderRingShareCard } from './ringShareCardCanvas';

import { createRingShareCanvas, downloadCanvasBlob } from './ringShareCardCanvas';
import type { RingShareData } from './ringShareCardTypes';

export function downloadRingShareCard(data: RingShareData): void {
  const canvas = createRingShareCanvas(data);
  const slug = (data.date ?? new Date().toISOString().slice(0, 10)).replace(/-/g, '');
  downloadCanvasBlob(canvas, `habits-rings-${slug}.png`);
}
