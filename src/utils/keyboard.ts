export type Finger =
  | 'leftPinky'
  | 'leftRing'
  | 'leftMiddle'
  | 'leftIndex'
  | 'rightIndex'
  | 'rightMiddle'
  | 'rightRing'
  | 'rightPinky'
  | 'thumbs'

const fingerMap: Record<string, Finger> = {
  q: 'leftPinky',
  a: 'leftPinky',
  z: 'leftPinky',
  w: 'leftRing',
  s: 'leftRing',
  x: 'leftRing',
  e: 'leftMiddle',
  d: 'leftMiddle',
  c: 'leftMiddle',
  r: 'leftIndex',
  f: 'leftIndex',
  v: 'leftIndex',
  t: 'leftIndex',
  g: 'leftIndex',
  b: 'leftIndex',
  y: 'rightIndex',
  h: 'rightIndex',
  n: 'rightIndex',
  u: 'rightIndex',
  j: 'rightIndex',
  m: 'rightIndex',
  i: 'rightMiddle',
  k: 'rightMiddle',
  o: 'rightRing',
  l: 'rightRing',
  p: 'rightPinky',
  ';': 'rightPinky',
  "'": 'rightPinky',
  ' ': 'thumbs',
}

export function normalizeKey(key: string): string {
  return key.length === 1 ? key.toLowerCase() : key.toLowerCase()
}

export function fingerForKey(key: string): Finger | null {
  return fingerMap[normalizeKey(key)] ?? null
}

export function isLetterKey(key: string): boolean {
  return /^[a-z]$/i.test(key)
}

export function isPrintableKey(key: string): boolean {
  if (key.length !== 1) return key === ' '
  return /[ -~]/.test(key)
}

export interface VirtualKey {
  code: string
  label: string
  finger: Finger | null
  width?: number
}

export const KEYBOARD_ROWS: VirtualKey[][] = [
  [
    { code: 'Backquote', label: '`', finger: 'leftPinky' },
    { code: 'Digit1', label: '1', finger: 'leftPinky' },
    { code: 'Digit2', label: '2', finger: 'leftPinky' },
    { code: 'Digit3', label: '3', finger: 'leftRing' },
    { code: 'Digit4', label: '4', finger: 'leftMiddle' },
    { code: 'Digit5', label: '5', finger: 'leftIndex' },
    { code: 'Digit6', label: '6', finger: 'rightIndex' },
    { code: 'Digit7', label: '7', finger: 'rightIndex' },
    { code: 'Digit8', label: '8', finger: 'rightMiddle' },
    { code: 'Digit9', label: '9', finger: 'rightRing' },
    { code: 'Digit0', label: '0', finger: 'rightPinky' },
    { code: 'Minus', label: '-', finger: 'rightPinky' },
    { code: 'Equal', label: '=', finger: 'rightPinky' },
    { code: 'Backspace', label: '⌫', finger: null, width: 1.8 },
  ],
  [
    { code: 'Tab', label: 'Tab', finger: 'leftPinky', width: 1.5 },
    { code: 'KeyQ', label: 'Q', finger: 'leftPinky' },
    { code: 'KeyW', label: 'W', finger: 'leftRing' },
    { code: 'KeyE', label: 'E', finger: 'leftMiddle' },
    { code: 'KeyR', label: 'R', finger: 'leftIndex' },
    { code: 'KeyT', label: 'T', finger: 'leftIndex' },
    { code: 'KeyY', label: 'Y', finger: 'rightIndex' },
    { code: 'KeyU', label: 'U', finger: 'rightIndex' },
    { code: 'KeyI', label: 'I', finger: 'rightMiddle' },
    { code: 'KeyO', label: 'O', finger: 'rightRing' },
    { code: 'KeyP', label: 'P', finger: 'rightPinky' },
    { code: 'BracketLeft', label: '[', finger: 'rightPinky' },
    { code: 'BracketRight', label: ']', finger: 'rightPinky' },
    { code: 'Backslash', label: '\\', finger: 'rightPinky', width: 1.5 },
  ],
  [
    { code: 'CapsLock', label: 'Caps', finger: 'leftPinky', width: 1.8 },
    { code: 'KeyA', label: 'A', finger: 'leftPinky' },
    { code: 'KeyS', label: 'S', finger: 'leftRing' },
    { code: 'KeyD', label: 'D', finger: 'leftMiddle' },
    { code: 'KeyF', label: 'F', finger: 'leftIndex' },
    { code: 'KeyG', label: 'G', finger: 'leftIndex' },
    { code: 'KeyH', label: 'H', finger: 'rightIndex' },
    { code: 'KeyJ', label: 'J', finger: 'rightIndex' },
    { code: 'KeyK', label: 'K', finger: 'rightMiddle' },
    { code: 'KeyL', label: 'L', finger: 'rightRing' },
    { code: 'Semicolon', label: ';', finger: 'rightPinky' },
    { code: "Quote", label: "'", finger: 'rightPinky' },
    { code: 'Enter', label: '⏎', finger: null, width: 1.8 },
  ],
  [
    { code: 'ShiftLeft', label: 'Shift', finger: 'leftPinky', width: 2.2 },
    { code: 'KeyZ', label: 'Z', finger: 'leftPinky' },
    { code: 'KeyX', label: 'X', finger: 'leftRing' },
    { code: 'KeyC', label: 'C', finger: 'leftMiddle' },
    { code: 'KeyV', label: 'V', finger: 'leftIndex' },
    { code: 'KeyB', label: 'B', finger: 'leftIndex' },
    { code: 'KeyN', label: 'N', finger: 'rightIndex' },
    { code: 'KeyM', label: 'M', finger: 'rightIndex' },
    { code: 'Comma', label: ',', finger: 'rightMiddle' },
    { code: 'Period', label: '.', finger: 'rightRing' },
    { code: 'Slash', label: '/', finger: 'rightPinky' },
    { code: 'ShiftRight', label: 'Shift', finger: 'rightPinky', width: 2.2 },
  ],
  [
    { code: 'Space', label: 'Space', finger: 'thumbs', width: 5 },
  ],
]

export function detectCapsLock(event: KeyboardEvent): boolean | null {
  if ('getModifierState' in event) {
    return event.getModifierState('CapsLock')
  }
  return null
}
