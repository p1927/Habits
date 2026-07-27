import { RING_SHARE_SURFACE } from './ringShareCardTheme';

export function drawProgressRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  lineWidth: number,
  value: number,
  max: number,
  color: string,
) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = RING_SHARE_SURFACE;
  ctx.lineWidth = lineWidth;
  ctx.stroke();

  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  if (pct <= 0) return;

  ctx.beginPath();
  ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.stroke();
}
