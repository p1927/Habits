import { RING_SHARE_HEIGHT, RING_SHARE_WIDTH } from './ringShareCardTheme';
import type { RingShareData } from './ringShareCardTypes';
import { downloadCanvasBlob, formatShareDate } from './ringShareCardExport';
import { renderRingShareCard } from './ringShareCardRender';

export { downloadCanvasBlob, formatShareDate, renderRingShareCard };

export function createRingShareCanvas(data: RingShareData): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = RING_SHARE_WIDTH;
  canvas.height = RING_SHARE_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  renderRingShareCard(ctx, data);
  return canvas;
}
