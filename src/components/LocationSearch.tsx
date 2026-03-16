import { useState, useCallback, useEffect, useId } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Star, Filter, AlertCircle } from 'lucide-react'
import { McDonaldsLocation, searchLocations, SearchParams, getCurrentLocation, formatDistance } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface LocationSearchProps {
  onLocationSelect?: (location: McDonaldsLocation) => void
  initialQuery?: string
}

export function LocationSearch({ onLocationSelect, initialQuery = '' }: LocationSearchProps) {
  const searchId = useId()
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [locations, setLocations] = useState<McDonaldsLocation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState<{
    minRating: number | undefined
    openNow: boolean
    sortBy: 'distance' | 'rating' | 'name'
    radius: number
  }>({
    minRating: undefined,
    openNow: false,
    sortBy: 'distance',
    radius: 20000
  })
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    getCurrentLocation()
      .then(setUserLocation)
      .catch(() => {
        setUserLocation({ latitude: 51.5074, longitude: -0.1278 })
      })
  }, [])

  const performSearch = useCallback(async () => {
    if (!userLocation && !searchQuery.trim()) return

    setLoading(true)
    setError('')
    setHasSearched(true)

    try {
      const searchParams: SearchParams = {
        searchQuery: searchQuery.trim() || undefined,
        latitude: searchQuery.trim() ? undefined : userLocation?.latitude,
        longitude: searchQuery.trim() ? undefined : userLocation?.longitude,
        radius: filters.radius,
        minRating: filters.minRating,
        openNow: filters.openNow,
        sortBy: filters.sortBy,
        limit: 50
      }

      const result = await searchLocations(searchParams)
      setLocations(result.locations)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search locations')
      setLocations([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery, filters, userLocation])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch()
  }

  const searchNearby = () => {
    if (userLocation) {
      setSearchQuery('')
      performSearch()
    }
  }

  const ratingFilterId = `${searchId}-rating`
  const radiusFilterId = `${searchId}-radius`
  const sortFilterId = `${searchId}-sort`
  const openNowId = `${searchId}-open-now`

  return (
    <div className="w-full">
      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6" role="search" aria-label="Search McDonald's locations">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <label htmlFor={`${searchId}-input`} className="sr-only">
                Search by location, postcode, or area
              </label>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
              <input
                id={`${searchId}-input`}
                type="search"
                placeholder="Search by location, postcode, or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500"
                autoComplete="off"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {loading ? <LoadingSpinner size="sm" label="Searching" /> : <Search className="h-5 w-5" aria-hidden="true" />}
                Search
              </button>

              <button
                type="button"
                onClick={searchNearby}
                disabled={loading || !userLocation}
                className="px-4 py-3 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <MapPin className="h-5 w-5" aria-hidden="true" />
                Nearby
              </button>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 transition-colors flex items-center gap-2"
                aria-expanded={showFilters}
                aria-controls={`${searchId}-filters`}
              >
                <Filter className="h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div id={`${searchId}-filters`} className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <fieldset>
                <legend className="sr-only">Search filters</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor={ratingFilterId} className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Rating
                    </label>
                    <select
                      id={ratingFilterId}
                      value={filters.minRating || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, minRating: e.target.value ? Number(e.target.value) : undefined }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Any rating</option>
                      <option value="4.5">4.5+ stars</option>
                      <option value="4.0">4.0+ stars</option>
                      <option value="3.5">3.5+ stars</option>
                      <option value="3.0">3.0+ stars</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor={radiusFilterId} className="block text-sm font-medium text-gray-700 mb-2">
                      Search Radius
                    </label>
                    <select
                      id={radiusFilterId}
                      value={filters.radius}
                      onChange={(e) => setFilters(prev => ({ ...prev, radius: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    >
                      <option value={2000}>2 km</option>
                      <option value={5000}>5 km</option>
                      <option value={10000}>10 km</option>
                      <option value={20000}>20 km</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor={sortFilterId} className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      id={sortFilterId}
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as 'distance' | 'rating' | 'name' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="distance">Distance</option>
                      <option value="rating">Rating</option>
                      <option value="name">Name</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={openNowId}
                      checked={filters.openNow}
                      onChange={(e) => setFilters(prev => ({ ...prev, openNow: e.target.checked }))}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor={openNowId} className="ml-2 text-sm font-medium text-gray-700">
                      Open now only
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>
          )}
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" aria-hidden="true" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {hasSearched && (
        <div className="mt-6" aria-live="polite" aria-atomic="true">
          {loading ? (
            <div className="flex items-center justify-center py-12" role="status">
              <LoadingSpinner size="lg" label="Searching locations" />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {locations.length > 0
                    ? `Found ${locations.length} location${locations.length === 1 ? '' : 's'}`
                    : 'No locations found'}
                </h2>
              </div>

              {locations.length > 0 ? (
                <div className="grid gap-4" role="list" aria-label="Search results">
                  {locations.map((location) => (
                    <div key={location.id} role="listitem">
                      <LocationCard location={location} onSelect={onLocationSelect} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or expanding your search radius.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface LocationCardProps {
  location: McDonaldsLocation
  onSelect?: (location: McDonaldsLocation) => void
}

function LocationCard({ location, onSelect }: LocationCardProps) {
  const isOpen = location.business_status === 'OPERATIONAL'

  return (
    <article className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow p-6">
      <div className="flex flex-col md:flex-row gap-4">
        {location.photo && (
          <div className="w-full md:w-32 h-32 flex-shrink-0">
            <img
              src={location.photo}
              alt=""
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{location.name}</h3>
              <p className="text-gray-600 mb-2">{location.address}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {location.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" aria-hidden="true" />
                    <span className="font-medium">{location.rating}</span>
                    <span className="sr-only">out of 5 stars,</span>
                    <span>({location.reviews_count} reviews)</span>
                  </div>
                )}

                {location.distance && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    <span>{formatDistance(location.distance)}</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <span
                    className={`h-2 w-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}
                    aria-hidden="true"
                  />
                  <span className={`font-medium ${isOpen ? 'text-green-700' : 'text-red-700'}`}>
                    {isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                to={`/location/${location.slug}`}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                View Details
                <span className="sr-only"> for {location.name}</span>
              </Link>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Directions
                <span className="sr-only"> to {location.name} (opens in Google Maps)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
