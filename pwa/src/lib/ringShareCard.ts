export interface RingShareData {
  protein: { value: number; max: number };
  calories: { value: number; max: number };
  habits: { value: number; max: number };
  date?: string;
  streakDays?: number;
}

const BG = '#0f172a';
const SURFACE2 = '#334155';
const TEXT = '#f1f5f9';
const MUTED = '#94a3b8';
const RING_HABITS = '#bf5af2';
const RING_CALORIES = '#ff9500';
const RING_PROTEIN = '#ff375f';
const STREAK_OK = '#4ade80';

function drawProgressRing(
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
  ctx.strokeStyle = SURFACE2;
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

function formatShareDate(iso?: string): string {
  const d = iso ? new Date(`${iso}T12:00:00`) : new Date();
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

export function downloadRingShareCard(data: RingShareData): void {
  const width = 720;
  const height = 720;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, BG);
  gradient.addColorStop(1, '#1a2744');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = TEXT;
  ctx.font = 'bold 36px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Habits', width / 2, 72);

  ctx.fillStyle = MUTED;
  ctx.font = '22px system-ui, sans-serif';
  ctx.fillText(formatShareDate(data.date), width / 2, 108);

  let ringsTop = 340;
  if (data.streakDays != null && data.streakDays > 0) {
    const streakLabel = `${data.streakDays}-day all-target streak`;
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
    ctx.fillStyle = STREAK_OK;
    ctx.textAlign = 'center';
    ctx.fillText(streakLabel, width / 2, pillY + 25);
    ringsTop = 352;
  }

  const cx = width / 2;
  const cy = ringsTop;
  drawProgressRing(ctx, cx, cy, 118, 14, data.habits.value, data.habits.max, RING_HABITS);
  drawProgressRing(ctx, cx, cy, 94, 12, data.calories.value, data.calories.max, RING_CALORIES);
  drawProgressRing(ctx, cx, cy, 70, 10, data.protein.value, data.protein.max, RING_PROTEIN);

  ctx.fillStyle = TEXT;
  ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.fillText(`${Math.round(data.habits.value)}%`, cx, cy + 10);

  const legendY = 520;
  const legends = [
    { color: RING_HABITS, label: 'Habits', value: `${Math.round(data.habits.value)}%` },
    { color: RING_CALORIES, label: 'Calories', value: `${Math.round(data.calories.value)}` },
    { color: RING_PROTEIN, label: 'Protein', value: `${Math.round(data.protein.value)}g` },
  ];

  legends.forEach((item, i) => {
    const y = legendY + i * 44;
    ctx.textAlign = 'left';
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(width / 2 - 120, y - 6, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = TEXT;
    ctx.font = '24px system-ui, sans-serif';
    ctx.fillText(item.label, width / 2 - 96, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = MUTED;
    ctx.fillText(item.value, width / 2 + 120, y);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = MUTED;
  ctx.font = '18px system-ui, sans-serif';
  ctx.fillText('Track habits · food · health', width / 2, height - 48);

  const slug = (data.date ?? new Date().toISOString().slice(0, 10)).replace(/-/g, '');
  downloadCanvas(canvas, `habits-rings-${slug}.png`);
}
