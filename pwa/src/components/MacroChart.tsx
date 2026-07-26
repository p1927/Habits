interface MacroBarProps {
  label: string;
  value: number;
  target: number;
  color: string;
}

export function MacroBar({ label, value, target, color }: MacroBarProps) {
  const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  return (
    <div className="macro-bar">
      <div className="macro-bar__header">
        <span>{label}</span>
        <span className="macro-bar__nums">
          {Math.round(value)} / {Math.round(target)}g
        </span>
      </div>
      <div className="macro-bar__track">
        <div className="macro-bar__fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export function Sparkline({ data, color = 'var(--accent)', height = 48 }: SparklineProps) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 200;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = height - ((v - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg className="sparkline" width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
}
