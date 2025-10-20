export type StorageAdapter = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

const isBrowser = typeof window !== 'undefined'

const safeStorage: StorageAdapter | null = (() => {
  if (!isBrowser) return null
  try {
    const { localStorage } = window
    const key = '__typing_trainer_test__'
    localStorage.setItem(key, key)
    localStorage.removeItem(key)
    return localStorage
  } catch (error) {
    console.warn('Local storage is not available; falling back to in-memory store.', error)
    return null
  }
})()

const memoryStore = new Map<string, string>()

export const storage: StorageAdapter = {
  getItem(key) {
    if (safeStorage) {
      return safeStorage.getItem(key)
    }
    return memoryStore.get(key) ?? null
  },
  setItem(key, value) {
    if (safeStorage) {
      safeStorage.setItem(key, value)
      return
    }
    memoryStore.set(key, value)
  },
  removeItem(key) {
    if (safeStorage) {
      safeStorage.removeItem(key)
      return
    }
    memoryStore.delete(key)
  },
}

export function loadJSON<T>(key: string, fallback: T): T {
  const raw = storage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch (error) {
    console.warn(`Failed to parse storage item "${key}"`, error)
    storage.removeItem(key)
    return fallback
  }
}

export function saveJSON<T>(key: string, value: T): void {
  storage.setItem(key, JSON.stringify(value))
}
