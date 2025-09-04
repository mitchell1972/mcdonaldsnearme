import React, { useState, useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { LocationSearch } from '@/components/LocationSearch'
import { LocationMap } from '@/components/LocationMap'
import { SEOHead } from '@/components/SEOHead'
import { McDonaldsLocation, searchLocations } from '@/lib/supabase'
import { MapPin, Star, Users, Clock, Navigation, Phone, Truck, Coffee } from 'lucide-react'

export function HomePage() {
  const [locations, setLocations] = useState<McDonaldsLocation[]>([])
  const [selectedLocation, setSelectedLocation] = useState<McDonaldsLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalLocations: 0,
    averageRating: 0,
    totalReviews: 0,
    open24Hours: 0
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
      const open24Hours = result.locations.filter(loc => 
        loc.working_hours?.includes('24') || loc.working_hours?.includes('Open 24')
      ).length
      
      const statsToSet = {
        totalLocations,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        open24Hours
      }
      
      console.log('📋 DEBUG: Setting stats:', JSON.stringify({
        totalLocations: statsToSet.totalLocations,
        averageRating: statsToSet.averageRating,
        totalReviews: statsToSet.totalReviews,
        open24Hours: statsToSet.open24Hours
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
    title: "McDonald's Near Me | Find Nearest McDonald's & Closest McDonald's to My Location",
    description: "Find McDonald's near me now. Search nearest McDonald's, closest McDonald's to my location, 24 hour McDonald's near me. Order McDonald's online, McDelivery near me, McDonald's DoorDash, Uber Eats & Just Eat. Real-time McDonald's hours near me, deals, and directions to the closest McDonald's restaurant.",
    keywords: "mcdonald's near me, mc donalds near me, nearest mcdonald's, closest mcdonald's, mcd near me, maccas near me, closest mcdonald's to me, order mcdonald's near me, mcdonald's near me now, mcdonald's near me now open, mcdelivery near me, nearest mcdonald's near me, closest mcdonald's to my location, 24 hour mcdonald's near me, the nearest mcdonald's, closest mcdonald's near me, mcdonald's open near me, nearest mcdonald's to my location, the closest mcdonald's, mcdonald's restaurant near me",
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'McDonald\'s Near Me Directory',
      'description': 'Complete directory to find McDonald\'s near me, nearest McDonald\'s, closest McDonald\'s to my location. Search 24 hour McDonald\'s, order online via McDelivery, DoorDash, Uber Eats & Just Eat.',
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
    <>
      <SEOHead isHomePage={true} pageType="home" />
      <Layout seo={seoData}>
        {/* Hero Section with Enhanced Keywords */}
        <section className="bg-gradient-to-br from-red-600 to-red-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Find McDonald's Near Me
                <span className="block text-yellow-400 text-3xl md:text-4xl lg:text-5xl mt-2">
                  Nearest McDonald's & Closest Locations
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-red-100 max-w-4xl mx-auto">
                Discover the nearest McDonald's to your location. Find closest McDonald's restaurants, 
                24 hour McDonald's near me, McDonald's open now. Order online via McDelivery, 
                DoorDash, Uber Eats & Just Eat.
              </p>
            </div>
            
            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
                <MapPin className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{stats.totalLocations}+</div>
                <div className="text-red-100">McDonald's Locations</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
                <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{stats.averageRating}</div>
                <div className="text-red-100">Average Rating</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
                <Users className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{stats.totalReviews.toLocaleString()}+</div>
                <div className="text-red-100">Customer Reviews</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
                <Clock className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{stats.open24Hours}+</div>
                <div className="text-red-100">24 Hour Locations</div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section with Keywords */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Find The Nearest McDonald's Near Me
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Search for McDonald's near me by postcode, city, or use GPS to find the closest McDonald's 
                to my location. Get directions to the nearest McDonald's restaurant, check McDonald's 
                hours near me, and order McDonald's online.
              </p>
            </div>
            
            <LocationSearch onLocationSelect={handleLocationSelect} />
            
            {/* Quick Search Keywords */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-3">Popular searches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'McDonald\'s near me now',
                  'Closest McDonald\'s',
                  '24 hour McDonald\'s',
                  'McDonald\'s open near me',
                  'McDelivery near me',
                  'McDonald\'s DoorDash',
                  'Nearest McDonald\'s',
                  'McDonald\'s Uber Eats'
                ].map((term) => (
                  <span key={term} className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-300">
                    {term}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Interactive Map - McDonald's Locations Near Me
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Explore all McDonald's near me on our interactive map. Find the closest McDonald's 
                to your location, get directions to the nearest McDonald's, and discover 
                McDonald's restaurants around you.
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

        {/* Services Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                McDonald's Services & Ordering Options Near Me
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Order McDonald's near me through multiple convenient options. Find McDonald's 
                that delivers, 24 hour McDonald's locations, and restaurants with McCafé near you.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">McDelivery Near Me</h3>
                <p className="text-gray-600">
                  Order McDonald's delivery near me through the official McDelivery service. 
                  Fast delivery to your location.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">DoorDash & Uber Eats</h3>
                <p className="text-gray-600">
                  McDonald's DoorDash near me and McDonald's Uber Eats near me available 
                  for quick online ordering.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">24 Hour McDonald's</h3>
                <p className="text-gray-600">
                  Find 24 hour McDonald's near me. Many locations open 24/7 for late-night 
                  cravings and early morning meals.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Coffee className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">McCafé Near Me</h3>
                <p className="text-gray-600">
                  Discover McDonald's with McCafé near me. Premium coffee, pastries, 
                  and specialty drinks available.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section with Keywords */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Use Our McDonald's Near Me Directory?
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                The most comprehensive tool to find McDonald's near me. Get accurate information 
                about the nearest McDonald's, closest McDonald's to your location, and 
                McDonald's restaurants around you.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Navigation className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Find The Nearest McDonald's
                </h3>
                <p className="text-gray-600">
                  Instantly locate the nearest McDonald's to your current location. 
                  Get precise directions to the closest McDonald's restaurant with 
                  real-time distance calculations.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  McDonald's Hours Near Me
                </h3>
                <p className="text-gray-600">
                  Check McDonald's hours near me including 24 hour McDonald's locations. 
                  Know which McDonald's near me are open now and plan your visit accordingly.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  McDonald's Deals Near Me
                </h3>
                <p className="text-gray-600">
                  Find McDonald's deals near me and special offers at your nearest location. 
                  View ratings and reviews to choose the best McDonald's restaurant near you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Locations with Keywords */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Popular McDonald's Locations Near Me
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Top-rated McDonald's restaurants near you. Find the closest McDonald's 
                with the best reviews, McDonald's open near me now, and 24 hour locations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.slice(0, 6).map((location) => (
                <div key={location.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {location.photo && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={location.photo}
                        alt={`${location.name} - McDonald's near me`}
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
                          <span>({location.reviews_count} reviews)</span>
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
                      aria-label={`View details for ${location.name} - Nearest McDonald's`}
                    >
                      View Details & Directions
                    </a>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <a
                href="/locations"
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                aria-label="View all McDonald's locations near me"
              >
                View All McDonald's Locations Near Me
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* FAQ Section for SEO */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600">
                Common questions about finding McDonald's near me
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How do I find the nearest McDonald's to my location?
                </h3>
                <p className="text-gray-600">
                  Use our McDonald's locator to find the nearest McDonald's. Simply enter your 
                  postcode or enable location services to instantly find the closest McDonald's 
                  restaurants near you with real-time distance and directions.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Are there 24 hour McDonald's near me?
                </h3>
                <p className="text-gray-600">
                  Yes, many McDonald's locations operate 24 hours. Our directory shows which 
                  McDonald's near you are open 24/7. Check individual restaurant pages for 
                  current McDonald's hours near me.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I order McDonald's online near me?
                </h3>
                <p className="text-gray-600">
                  Yes! Order McDonald's near me through McDelivery, McDonald's DoorDash near me, 
                  McDonald's Uber Eats near me, or McDonald's Just Eat near me. Check each 
                  location for available delivery options.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How do I find McDonald's deals near me?
                </h3>
                <p className="text-gray-600">
                  Find McDonald's deals near me through our directory. Each McDonald's location 
                  page shows current promotions, app deals, and special offers available at 
                  that specific restaurant.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What's the closest McDonald's to me right now?
                </h3>
                <p className="text-gray-600">
                  Enable location services or enter your postcode to find the closest McDonald's 
                  to your current location. We'll show you the nearest McDonald's with distance, 
                  directions, and whether they're open now.
                </p>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  )
}
