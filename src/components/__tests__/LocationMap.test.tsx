import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test/test-utils'
import { mockLocations } from '../../test/test-utils'

// Mock the Google Maps API loader
vi.mock('@react-google-maps/api', () => ({
  useJsApiLoader: vi.fn().mockReturnValue({ isLoaded: false, loadError: null }),
  GoogleMap: ({ children }: { children: React.ReactNode }) => <div data-testid="google-map">{children}</div>,
  Marker: () => null,
  InfoWindow: () => null,
  MarkerClusterer: ({ children }: { children: (clusterer: any) => React.ReactNode }) => <>{children({})}</>,
}))

import { LocationMap } from '../LocationMap'
import { useJsApiLoader } from '@react-google-maps/api'

describe('LocationMap', () => {
  it('renders loading state with accessible label', () => {
    vi.mocked(useJsApiLoader).mockReturnValue({ isLoaded: false, loadError: undefined } as any)

    render(<LocationMap locations={mockLocations} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Loading map...')).toBeInTheDocument()
  })

  it('renders error state with alert role', () => {
    vi.mocked(useJsApiLoader).mockReturnValue({ isLoaded: false, loadError: new Error('Failed') } as any)

    render(<LocationMap locations={mockLocations} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Map unavailable')).toBeInTheDocument()
  })

  it('provides screen reader location list on error', () => {
    vi.mocked(useJsApiLoader).mockReturnValue({ isLoaded: false, loadError: new Error('Failed') } as any)

    render(<LocationMap locations={mockLocations} />)
    // SR-only list should contain location names
    const srContent = document.querySelector('.sr-only')
    expect(srContent).toBeInTheDocument()
    expect(srContent?.textContent).toContain("McDonald's Leicester Square")
    expect(srContent?.textContent).toContain("McDonald's Oxford Street")
  })

  it('renders screen reader description when map loads', () => {
    vi.mocked(useJsApiLoader).mockReturnValue({ isLoaded: true, loadError: undefined } as any)

    render(<LocationMap locations={mockLocations} />)
    const srRegion = screen.getByRole('region', { name: /map showing/i })
    expect(srRegion).toBeInTheDocument()
    expect(srRegion.textContent).toContain('3')
  })

  it('renders google map when loaded', () => {
    vi.mocked(useJsApiLoader).mockReturnValue({ isLoaded: true, loadError: undefined } as any)

    render(<LocationMap locations={mockLocations} />)
    expect(screen.getByTestId('google-map')).toBeInTheDocument()
  })
})
