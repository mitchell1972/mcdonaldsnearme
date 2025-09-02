import React, { useState, useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { LocationSearch } from '@/components/LocationSearch'
import { LocationMap } from '@/components/LocationMap'
import { McDonaldsLocation, searchLocations } from '@/lib/supabase'
import { MapPin, Star, Users, Clock } from 'lucide-react'

export function HomePage() {
  const [locations, setLocations] = useState<McDonaldsLocation[]>([])
  const [selectedLocation, setSelectedLocation] = useState<McDonaldsLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalLocations: 0,
    averageRating: 0,
    totalReviews: 0
  })

  // Load initial locations and stats
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      console.log('🔍 DEBUG: Starting loadInitialData')
      
      // Load all locations without geographic filtering
      const result = await searchLocations({
        limit: 285, // Get all locations
        sortBy: 'rating'
      })
      
      console.log('📊 DEBUG: SearchLocations result:', {
        locationsCount: result.locations.length,
        totalFromQuery: result.total,
        first3: result.locations.slice(0, 3).map(l => ({ name: l.name, rating: l.rating }))
      })
      
      setLocations(result.locations)
      console.log('📊 DEBUG: setLocations called with', result.locations.length, 'locations')
      
      // Calculate stats
      const totalLocations = result.locations.length
      const ratingsSum = result.locations.reduce((sum, loc) => sum + (loc.rating || 0), 0)
      const locationsWithRating = result.locations.filter(loc => loc.rating).length
      const averageRating = locationsWithRating > 0 ? ratingsSum / locationsWithRating : 0
      const totalReviews = result.locations.reduce((sum, loc) => sum + loc.reviews_count, 0)
      
      const statsToSet = {
        totalLocations,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews
      }
      
      console.log('📋 DEBUG: Setting stats:', JSON.stringify({
        totalLocations: statsToSet.totalLocations,
        averageRating: statsToSet.averageRating,
        totalReviews: statsToSet.totalReviews
      }, null, 2))
      setStats(statsToSet)
    } catch (error) {
      console.error('❌ Failed to load initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSelect = (location: McDonaldsLocation) => {
    setSelectedLocation(location)
  }

  const seoData = {
    title: 'McDonald\'s Locations in London | Find Your Nearest Restaurant Directory',
    description: 'Find McDonald\'s restaurants near me in London. Search 285+ locations by postcode, area, or GPS. View opening hours, ratings, photos, and get directions to your nearest McDonald\'s.',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'McDonald\'s Directory London',
      'description': 'Complete directory of McDonald\'s restaurants in London with search, maps, and location details',
      'url': typeof window !== 'undefined' ? window.location.href : '',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': '/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      },
      'mainEntity': {
        '@type': 'ItemList',
        'numberOfItems': stats.totalLocations,
        'itemListElement': locations.slice(0, 10).map((location, index) => ({
          '@type': 'LocalBusiness',
          'position': index + 1,
          'name': location.name,
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': location.address,
            'addressLocality': location.city,
            'postalCode': location.postal_code,
            'addressCountry': 'GB'
          },
          'geo': {
            '@type': 'GeoCoordinates',
            'latitude': location.latitude,
            'longitude': location.longitude
          },
          'aggregateRating': location.rating ? {
            '@type': 'AggregateRating',
            'ratingValue': location.rating,
            'reviewCount': location.reviews_count
          } : undefined
        }))
      }
    }
  }

  return (
    <Layout seo={seoData}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Find Your Nearest
              <span className="block text-yellow-400">McDonald's</span>
            </h1>
            <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto">
              Discover 285+ McDonald's locations across London. Search by location, check opening hours, and get directions.
            </p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
              <MapPin className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{stats.totalLocations}+</div>
              <div className="text-red-100">Locations</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
              <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{stats.averageRating}</div>
              <div className="text-red-100">Average Rating</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
              <Users className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{stats.totalReviews.toLocaleString()}+</div>
              <div className="text-red-100">Reviews</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Find McDonald's Near Me</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Search by postcode, area, or use your current location to find the nearest McDonald's restaurants.
            </p>
          </div>
          
          <LocationSearch onLocationSelect={handleLocationSelect} />
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Interactive Map</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore all McDonald's locations on our interactive map. Click on markers for details and directions.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <LocationMap
              locations={locations}
              onLocationSelect={handleLocationSelect}
              height="600px"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Use Our Directory?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get comprehensive information about every McDonald's location in London.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Accurate Locations</h3>
              <p className="text-gray-600">
                Get precise locations with verified addresses, coordinates, and up-to-date information for all McDonald's restaurants.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Opening Hours</h3>
              <p className="text-gray-600">
                Check current opening hours, including 24-hour locations and special holiday hours for better planning.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ratings & Reviews</h3>
              <p className="text-gray-600">
                View customer ratings and read reviews to choose the best McDonald's location for your visit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Locations */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Locations</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Most visited McDonald's restaurants in London based on ratings and reviews.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.slice(0, 6).map((location) => (
              <div key={location.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {location.photo && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={location.photo}
                      alt={location.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{location.name}</h3>
                  <p className="text-gray-600 mb-3">{location.address}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    {location.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{location.rating}</span>
                        <span>({location.reviews_count})</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <div className={`h-2 w-2 rounded-full ${location.business_status === 'OPERATIONAL' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className={location.business_status === 'OPERATIONAL' ? 'text-green-600' : 'text-red-600'}>
                        {location.business_status === 'OPERATIONAL' ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </div>
                  
                  <a
                    href={`/location/${location.slug}`}
                    className="inline-block w-full px-4 py-2 bg-red-600 text-white text-center font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    View Details
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <a
              href="/locations"
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              View All Locations
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </Layout>
  )
}
