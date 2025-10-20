import { KEYBOARD_ROWS, normalizeKey } from '../utils/keyboard'

interface VirtualKeyboardProps {
  highlightedKeys: string[]
  errorKeys: string[]
  capsLock: boolean
  colorBlindMode?: boolean
}

const FINGER_CLASS: Record<string, string> = {
  leftPinky: 'vk-key--left-pinky',
  leftRing: 'vk-key--left-ring',
  leftMiddle: 'vk-key--left-middle',
  leftIndex: 'vk-key--left-index',
  rightIndex: 'vk-key--right-index',
  rightMiddle: 'vk-key--right-middle',
  rightRing: 'vk-key--right-ring',
  rightPinky: 'vk-key--right-pinky',
  thumbs: 'vk-key--thumbs',
}

export function VirtualKeyboard({ highlightedKeys, errorKeys, capsLock, colorBlindMode }: VirtualKeyboardProps) {
  const highlightSet = new Set(highlightedKeys.map(normalizeKey))
  const errorSet = new Set(errorKeys.map(normalizeKey))

  return (
    <div className={`virtual-keyboard ${colorBlindMode ? 'virtual-keyboard--cb' : ''}`}>
      <div className="virtual-keyboard__status" aria-live="polite">
        Caps Lock: <span>{capsLock ? 'ON' : 'off'}</span>
      </div>
      {KEYBOARD_ROWS.map((row, index) => (
        <div key={index} className="virtual-keyboard__row">
          {row.map((key) => {
            const normalized = normalizeKey(key.label)
            const finger = key.finger ? FINGER_CLASS[key.finger] : ''
            const isActive = highlightSet.has(normalized)
            const isError = errorSet.has(normalized)
            const widthStyle = key.width ? { flex: key.width } : undefined
            return (
              <div
                key={key.code}
                className={`vk-key ${finger} ${isActive ? 'vk-key--active' : ''} ${
                  isError ? 'vk-key--error' : ''
                }`}
                style={widthStyle}
              >
                {key.label}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
