import { ProgressBar } from './ProgressBar'

interface FooterProps {
  elapsedMs: number
  durationMs: number
  wpm: number
  accuracy: number
  errors: number
}

export function Footer({ elapsedMs, durationMs, wpm, accuracy, errors }: FooterProps) {
  const remaining = Math.max(durationMs - elapsedMs, 0)
  const seconds = Math.ceil(remaining / 1000)
  const progress = Math.min(elapsedMs, durationMs)
  return (
    <footer className="app-footer">
      <div className="app-footer__metric">
        <span className="label">Time</span>
        <span className="value">{seconds}s</span>
      </div>
      <div className="app-footer__metric">
        <span className="label">Net WPM</span>
        <span className="value">{wpm.toFixed(1)}</span>
      </div>
      <div className="app-footer__metric">
        <span className="label">Accuracy</span>
        <span className="value">{accuracy.toFixed(1)}%</span>
      </div>
      <div className="app-footer__metric">
        <span className="label">Errors</span>
        <span className="value">{errors}</span>
      </div>
      <ProgressBar value={progress} max={durationMs} label="Session Progress" />
    </footer>
  )
}
