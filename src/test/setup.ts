import '@testing-library/jest-dom'
import FDBFactory from 'fake-indexeddb/lib/FDBFactory'
import FDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange'

// Setup fake IndexedDB for testing
global.indexedDB = new FDBFactory()
global.IDBKeyRange = FDBKeyRange

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => {
      return store[key] || null
    },
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    length: Object.keys(store).length,
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock notifications
Object.defineProperty(window, 'Notification', {
  value: class MockNotification {
    static permission = 'granted'
    static requestPermission = vi.fn().mockResolvedValue('granted')
    constructor(title: string, options?: NotificationOptions) {}
  }
})

// Mock audio
Object.defineProperty(window, 'HTMLAudioElement', {
  value: class MockAudio {
    src = ''
    volume = 1
    currentTime = 0
    play = vi.fn().mockResolvedValue(undefined)
    pause = vi.fn()
    load = vi.fn()
    addEventListener = vi.fn()
    removeEventListener = vi.fn()
  }
})

// Mock requestFullscreen and exitFullscreen
Object.defineProperty(document, 'fullscreenElement', {
  value: null,
  writable: true
})

Object.defineProperty(document.documentElement, 'requestFullscreen', {
  value: vi.fn().mockResolvedValue(undefined)
})

Object.defineProperty(document, 'exitFullscreen', {
  value: vi.fn().mockResolvedValue(undefined)
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))