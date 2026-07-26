import './ui.css';

interface RingProps {
  value: number;
  max: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  label?: string;
  unit?: string;
}

export function Ring({
  value,
  max,
  color,
  size = 88,
  strokeWidth = 8,
  label,
  unit = '',
}: RingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - pct);

  return (
    <div className="ui-ring" style={{ width: size, height: size }} role="img" aria-label={`${label ?? 'Progress'}: ${Math.round(value)}${unit} of ${Math.round(max)}${unit}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface2)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="ui-ring__progress"
        />
      </svg>
      <div className="ui-ring__center">
        <span className="ui-ring__value">
          {Math.round(value)}
          {unit && <span className="ui-ring__unit">{unit}</span>}
        </span>
        {label && <span className="ui-ring__label">{label}</span>}
      </div>
    </div>
  );
}

interface ActivityRingsProps {
  protein: { value: number; max: number };
  calories: { value: number; max: number };
  habits: { value: number; max: number };
}

export function ActivityRings({ protein, calories, habits }: ActivityRingsProps) {
  return (
    <div className="ui-rings-stack" role="group" aria-label="Activity rings">
      <Ring
        value={habits.value}
        max={habits.max}
        color="var(--ring-habits)"
        size={120}
        strokeWidth={10}
        label="Habits"
        unit="%"
      />
      <Ring
        value={calories.value}
        max={calories.max}
        color="var(--ring-calories)"
        size={96}
        strokeWidth={9}
        label="Cal"
        unit=""
      />
      <Ring
        value={protein.value}
        max={protein.max}
        color="var(--ring-protein)"
        size={72}
        strokeWidth={8}
        label="Protein"
        unit="g"
      />
    </div>
  );
}
