import { useEffect, useState } from 'react'

interface CountdownProps {
  seconds: number
  onComplete: () => void
}

export function Countdown({ seconds, onComplete }: CountdownProps) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    setRemaining(seconds)
  }, [seconds])

  useEffect(() => {
    if (remaining <= 0) {
      onComplete()
      return
    }
    const timer = setTimeout(() => setRemaining((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [remaining, onComplete])

  return (
    <div className="countdown" role="status" aria-live="assertive">
      <span>{remaining}</span>
    </div>
  )
}
