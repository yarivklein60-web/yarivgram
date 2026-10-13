export default function Range({ value, max, onChange, label, className = '' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <input
      type="range"
      dir="ltr"
      aria-label={label}
      min={0}
      max={max || 0}
      step="any"
      value={Math.min(value, max || 0)}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`range ${className}`}
      style={{ '--pct': `${pct}%` }}
    />
  );
}
