import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { NotFoundPage } from '@/pages/NotFoundPage'

// Mock supabase to prevent real API calls
vi.mock('@/lib/supabase', () => ({
  searchLocations: vi.fn().mockResolvedValue({ locations: [], total: 0 }),
  getCurrentLocation: vi.fn().mockResolvedValue({ latitude: 51.5074, longitude: -0.1278 }),
  getLocationBySlug: vi.fn().mockResolvedValue(null),
  parseWorkingHours: vi.fn().mockReturnValue({}),
  isLocationOpenNow: vi.fn().mockReturnValue(false),
  formatDistance: vi.fn((d: number) => `${(d / 1000).toFixed(1)} km`),
}))

// Mock Google Maps
vi.mock('@react-google-maps/api', () => ({
  useJsApiLoader: vi.fn().mockReturnValue({ isLoaded: false, loadError: null }),
  GoogleMap: () => null,
  Marker: () => null,
  InfoWindow: () => null,
  MarkerClusterer: () => null,
}))

function renderWithRouter(initialRoute: string) {
  return render(
    <HelmetProvider>
      <ErrorBoundary>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MemoryRouter>
      </ErrorBoundary>
    </HelmetProvider>
  )
}

describe('App Integration', () => {
  it('renders 404 page for unknown routes', () => {
    renderWithRouter('/some-unknown-page')
    expect(screen.getByRole('heading', { name: 'Page Not Found' })).toBeInTheDocument()
  })

  it('has accessible page structure on 404', () => {
    renderWithRouter('/unknown')
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByText('Skip to main content')).toBeInTheDocument()
  })

  it('404 page provides navigation back to home', () => {
    renderWithRouter('/invalid-path')
    const link = screen.getByRole('link', { name: /find mcdonald/i })
    expect(link).toHaveAttribute('href', '/')
  })
})
