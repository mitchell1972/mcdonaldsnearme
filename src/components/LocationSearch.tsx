import React, { useState, useCallback, useEffect } from 'react'
import { Search, MapPin, Star, Clock, Filter, X } from 'lucide-react'
import { McDonaldsLocation, searchLocations, SearchParams, getCurrentLocation, formatDistance } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface LocationSearchProps {
  onLocationSelect?: (location: McDonaldsLocation) => void
  initialQuery?: string
}

export function LocationSearch({ onLocationSelect, initialQuery = '' }: LocationSearchProps) {
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

  // Get user location on mount
  useEffect(() => {
    getCurrentLocation()
      .then(setUserLocation)
      .catch(() => {
        // Fallback to London center coordinates
        setUserLocation({ latitude: 51.5074, longitude: -0.1278 })
      })
  }, [])

  // Perform search
  const performSearch = useCallback(async () => {
    if (!userLocation && !searchQuery.trim()) return
    
    setLoading(true)
    setError('')
    setHasSearched(true)
    
    try {
      const searchParams: SearchParams = {
        searchQuery: searchQuery.trim() || undefined,
        latitude: userLocation?.latitude,
        longitude: userLocation?.longitude,
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

  // Search on form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch()
  }

  // Search nearby locations
  const searchNearby = () => {
    if (userLocation) {
      setSearchQuery('')
      performSearch()
    }
  }

  return (
    <div className="w-full">
      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location, postcode, or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {loading ? <LoadingSpinner size="sm" /> : <Search className="h-5 w-5" />}
                Search
              </button>
              
              <button
                type="button"
                onClick={searchNearby}
                disabled={loading || !userLocation}
                className="px-4 py-3 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <MapPin className="h-5 w-5" />
                Nearby
              </button>
              
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
              >
                <Filter className="h-5 w-5" />
                Filters
              </button>
            </div>
          </div>
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Minimum Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                  <select
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
                
                {/* Radius */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Radius</label>
                  <select
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
                
                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as 'distance' | 'rating' | 'name' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="distance">Distance</option>
                    <option value="rating">Rating</option>
                    <option value="name">Name</option>
                  </select>
                </div>
                
                {/* Open Now */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="openNow"
                    checked={filters.openNow}
                    onChange={(e) => setFilters(prev => ({ ...prev, openNow: e.target.checked }))}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="openNow" className="ml-2 text-sm font-medium text-gray-700">
                    Open now
                  </label>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <X className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {hasSearched && (
        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-600">Searching locations...</span>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {locations.length > 0 ? `Found ${locations.length} location${locations.length === 1 ? '' : 's'}` : 'No locations found'}
                </h2>
              </div>
              
              {locations.length > 0 ? (
                <div className="grid gap-4">
                  {locations.map((location) => (
                    <LocationCard
                      key={location.id}
                      location={location}
                      onSelect={onLocationSelect}
                    />
                  ))}
                </div>
              ) : hasSearched && (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
  const handleSelect = () => {
    onSelect?.(location)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow p-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Location Photo */}
        {location.photo && (
          <div className="w-full md:w-32 h-32 flex-shrink-0">
            <img
              src={location.photo}
              alt={location.name}
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
                {/* Rating */}
                {location.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{location.rating}</span>
                    <span>({location.reviews_count} reviews)</span>
                  </div>
                )}
                
                {/* Distance */}
                {location.distance && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{formatDistance(location.distance)}</span>
                  </div>
                )}
                
                {/* Status */}
                <div className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${location.business_status === 'OPERATIONAL' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className={location.business_status === 'OPERATIONAL' ? 'text-green-600' : 'text-red-600'}>
                    {location.business_status === 'OPERATIONAL' ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <a
                href={`/location/${location.slug}`}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                View Details
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
