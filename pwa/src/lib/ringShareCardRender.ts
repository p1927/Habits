import {
  RING_SHARE_BG,
  RING_SHARE_CALORIES,
  RING_SHARE_HABITS,
  RING_SHARE_HEIGHT,
  RING_SHARE_MUTED,
  RING_SHARE_PROTEIN,
  RING_SHARE_STREAK_OK,
  RING_SHARE_TEXT,
  RING_SHARE_WIDTH,
} from './ringShareCardTheme';
import type { RingShareData } from './ringShareCardTypes';
import { drawProgressRing } from './ringShareCardDrawRings';
import { formatShareDate } from './ringShareCardExport';

function drawStreakPill(ctx: CanvasRenderingContext2D, width: number, streakDays: number): number {
  const streakLabel = `${streakDays}-day all-target streak`;
  ctx.font = 'bold 20px system-ui, sans-serif';
  const textW = ctx.measureText(streakLabel).width;
  const pillW = textW + 32;
  const pillH = 36;
  const pillX = (width - pillW) / 2;
  const pillY = 124;
  ctx.fillStyle = 'rgba(74, 222, 128, 0.15)';
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 18);
  ctx.fill();
  ctx.fillStyle = RING_SHARE_STREAK_OK;
  ctx.textAlign = 'center';
  ctx.fillText(streakLabel, width / 2, pillY + 25);
  return 352;
}

export function renderRingShareCard(ctx: CanvasRenderingContext2D, data: RingShareData) {
  const width = RING_SHARE_WIDTH;
  const height = RING_SHARE_HEIGHT;

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, RING_SHARE_BG);
  gradient.addColorStop(1, '#1a2744');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = RING_SHARE_TEXT;
  ctx.font = 'bold 36px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Habits', width / 2, 72);

  ctx.fillStyle = RING_SHARE_MUTED;
  ctx.font = '22px system-ui, sans-serif';
  ctx.fillText(formatShareDate(data.date), width / 2, 108);

  let ringsTop = 340;
  if (data.streakDays != null && data.streakDays > 0) {
    ringsTop = drawStreakPill(ctx, width, data.streakDays);
  }

  const cx = width / 2;
  const cy = ringsTop;
  drawProgressRing(ctx, cx, cy, 118, 14, data.habits.value, data.habits.max, RING_SHARE_HABITS);
  drawProgressRing(ctx, cx, cy, 94, 12, data.calories.value, data.calories.max, RING_SHARE_CALORIES);
  drawProgressRing(ctx, cx, cy, 70, 10, data.protein.value, data.protein.max, RING_SHARE_PROTEIN);

  ctx.fillStyle = RING_SHARE_TEXT;
  ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.fillText(`${Math.round(data.habits.value)}%`, cx, cy + 10);

  const legendY = 520;
  const legends = [
    { color: RING_SHARE_HABITS, label: 'Habits', value: `${Math.round(data.habits.value)}%` },
    { color: RING_SHARE_CALORIES, label: 'Calories', value: `${Math.round(data.calories.value)}` },
    { color: RING_SHARE_PROTEIN, label: 'Protein', value: `${Math.round(data.protein.value)}g` },
  ];

  legends.forEach((item, i) => {
    const y = legendY + i * 44;
    ctx.textAlign = 'left';
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(width / 2 - 120, y - 6, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = RING_SHARE_TEXT;
    ctx.font = '24px system-ui, sans-serif';
    ctx.fillText(item.label, width / 2 - 96, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = RING_SHARE_MUTED;
    ctx.fillText(item.value, width / 2 + 120, y);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = RING_SHARE_MUTED;
  ctx.font = '18px system-ui, sans-serif';
  ctx.fillText('Track habits · food · health', width / 2, height - 48);
}
