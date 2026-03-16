import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <HelmetProvider>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </HelmetProvider>
  )
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options })
}

export * from '@testing-library/react'
export { customRender as render }

// Mock location data for tests
export const mockLocation = {
  id: '1',
  name: "McDonald's Leicester Square",
  slug: 'mcdonalds-leicester-square',
  address: '1 Leicester Square, London',
  city: 'London',
  postal_code: 'WC2H 7NA',
  latitude: 51.5112,
  longitude: -0.1281,
  phone: '+44 20 7839 1234',
  rating: 4.2,
  reviews_count: 150,
  business_status: 'OPERATIONAL' as const,
  working_hours: 'Monday: Open 24 hours, Tuesday: Open 24 hours, Wednesday: Open 24 hours, Thursday: Open 24 hours, Friday: Open 24 hours, Saturday: Open 24 hours, Sunday: Open 24 hours',
  photo: 'https://example.com/photo.jpg',
  about: {
    'Service options': {
      'Takeaway': true,
      'Dine-in': true,
      'Delivery': true,
      'Drive-through': false,
    },
    Amenities: {
      'Wi-Fi': true,
    },
    Accessibility: {
      'Wheelchair-accessible entrance': true,
    },
    Children: {
      'Play area': false,
    },
  },
  reviews_link: 'https://google.com/reviews',
  distance: 1500,
}

export const mockLocations = [
  mockLocation,
  {
    ...mockLocation,
    id: '2',
    name: "McDonald's Oxford Street",
    slug: 'mcdonalds-oxford-street',
    address: '100 Oxford Street, London',
    rating: 3.8,
    reviews_count: 89,
    business_status: 'CLOSED_TEMPORARILY' as const,
    photo: null,
    distance: 3200,
  },
  {
    ...mockLocation,
    id: '3',
    name: "McDonald's Waterloo",
    slug: 'mcdonalds-waterloo',
    address: 'Waterloo Station, London',
    rating: 4.5,
    reviews_count: 230,
    distance: 800,
  },
]
