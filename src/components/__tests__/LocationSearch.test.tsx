import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '../../test/test-utils'
import { LocationSearch } from '../LocationSearch'

// Mock the supabase module
vi.mock('@/lib/supabase', () => ({
  searchLocations: vi.fn().mockResolvedValue({ locations: [], total: 0 }),
  getCurrentLocation: vi.fn().mockResolvedValue({ latitude: 51.5074, longitude: -0.1278 }),
  formatDistance: vi.fn((d: number) => `${(d / 1000).toFixed(1)} km`),
}))

describe('LocationSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders search form with proper role', () => {
    render(<LocationSearch />)
    expect(screen.getByRole('search', { name: /search mcdonald/i })).toBeInTheDocument()
  })

  it('renders search input with accessible label', () => {
    render(<LocationSearch />)
    const input = screen.getByRole('searchbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'search')
  })

  it('renders Search button', () => {
    render(<LocationSearch />)
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('renders Nearby button', () => {
    render(<LocationSearch />)
    expect(screen.getByRole('button', { name: /nearby/i })).toBeInTheDocument()
  })

  it('renders Filters button with aria-expanded', () => {
    render(<LocationSearch />)
    const filtersBtn = screen.getByRole('button', { name: /filter/i })
    expect(filtersBtn).toHaveAttribute('aria-expanded', 'false')
  })

  it('toggles filter panel visibility', () => {
    render(<LocationSearch />)
    const filtersBtn = screen.getByRole('button', { name: /filter/i })

    fireEvent.click(filtersBtn)
    expect(filtersBtn).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByLabelText('Minimum Rating')).toBeInTheDocument()
    expect(screen.getByLabelText('Search Radius')).toBeInTheDocument()
    expect(screen.getByLabelText('Sort By')).toBeInTheDocument()
    expect(screen.getByLabelText('Open now only')).toBeInTheDocument()

    fireEvent.click(filtersBtn)
    expect(filtersBtn).toHaveAttribute('aria-expanded', 'false')
  })

  it('updates search query on input change', () => {
    render(<LocationSearch />)
    const input = screen.getByRole('searchbox')

    fireEvent.change(input, { target: { value: 'Leicester' } })
    expect(input).toHaveValue('Leicester')
  })

  it('submits form on enter/button click', () => {
    render(<LocationSearch />)
    const form = screen.getByRole('search')

    fireEvent.submit(form)
    // Should not crash
    expect(form).toBeInTheDocument()
  })

  it('renders filter labels associated with inputs', () => {
    render(<LocationSearch />)
    fireEvent.click(screen.getByRole('button', { name: /filter/i }))

    const ratingSelect = screen.getByLabelText('Minimum Rating')
    expect(ratingSelect.tagName).toBe('SELECT')

    const radiusSelect = screen.getByLabelText('Search Radius')
    expect(radiusSelect.tagName).toBe('SELECT')

    const sortSelect = screen.getByLabelText('Sort By')
    expect(sortSelect.tagName).toBe('SELECT')

    const openNow = screen.getByLabelText('Open now only')
    expect(openNow.tagName).toBe('INPUT')
    expect(openNow).toHaveAttribute('type', 'checkbox')
  })

  it('filter select options are accessible', () => {
    render(<LocationSearch />)
    fireEvent.click(screen.getByRole('button', { name: /filter/i }))

    const ratingSelect = screen.getByLabelText('Minimum Rating') as HTMLSelectElement
    expect(ratingSelect.options.length).toBe(5) // Any, 4.5, 4.0, 3.5, 3.0
  })
})
