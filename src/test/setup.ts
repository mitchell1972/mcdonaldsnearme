import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
})

// Mock google maps with proper constructable classes
class MockSize {
  width: number
  height: number
  constructor(w: number, h: number) {
    this.width = w
    this.height = h
  }
}

class MockPoint {
  x: number
  y: number
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
}

class MockLatLngBounds {
  extend = vi.fn()
}

const mockGoogle = {
  maps: {
    Map: vi.fn(),
    LatLngBounds: MockLatLngBounds,
    Size: MockSize,
    Point: MockPoint,
    Marker: vi.fn(),
    InfoWindow: vi.fn(),
    event: { addListener: vi.fn() },
  },
}
Object.defineProperty(window, 'google', {
  writable: true,
  value: mockGoogle,
})
