interface ProgressBarProps {
  value: number
  max: number
  label?: string
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percentage = Math.min(Math.max(value / max, 0), 1) * 100
  return (
    <div className="progress" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress__bar" style={{ width: `${percentage}%` }} />
      {label ? <span className="progress__label">{label}</span> : null}
    </div>
  )
}
