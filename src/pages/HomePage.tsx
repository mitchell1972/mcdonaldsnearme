import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { LocationSearch } from '@/components/LocationSearch'
import { LocationMap } from '@/components/LocationMap'
import { SEOHead } from '@/components/SEOHead'
import { McDonaldsLocation, searchLocations } from '@/lib/supabase'
import { MapPin, Star, Users, Clock, Navigation, Phone, Truck, Coffee, ChevronDown, ChevronRight } from 'lucide-react'

interface StatsData {
  totalLocations: number
  averageRating: number
  totalReviews: number
  open24Hours: number
}

function StatCard({ icon: Icon, value, label }: { icon: typeof MapPin; value: string; label: string }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
      <Icon className="h-8 w-8 text-yellow-400 mx-auto mb-2" aria-hidden="true" />
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-red-100">{label}</div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const id = question.replace(/\s+/g, '-').toLowerCase().slice(0, 30)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <h3>
        <button
          type="button"
          className="flex items-center justify-between w-full p-6 text-left text-lg font-semibold text-gray-900 hover:bg-gray-50 transition-colors rounded-lg"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls={`faq-${id}`}
        >
          <span>{question}</span>
          <ChevronDown
            className={`h-5 w-5 text-gray-500 transition-transform flex-shrink-0 ml-4 ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      </h3>
      {isOpen && (
        <div id={`faq-${id}`} role="region" aria-labelledby={`faq-${id}-btn`} className="px-6 pb-6">
          <p className="text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  )
}

export function HomePage() {
  const [locations, setLocations] = useState<McDonaldsLocation[]>([])
  const [selectedLocation, setSelectedLocation] = useState<McDonaldsLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<StatsData>({
    totalLocations: 0,
    averageRating: 0,
    totalReviews: 0,
    open24Hours: 0
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const result = await searchLocations({
        limit: 285,
        sortBy: 'rating'
      })

      setLocations(result.locations)

      const totalLocations = result.locations.length
      const ratingsSum = result.locations.reduce((sum, loc) => sum + (loc.rating || 0), 0)
      const locationsWithRating = result.locations.filter(loc => loc.rating).length
      const averageRating = locationsWithRating > 0 ? ratingsSum / locationsWithRating : 0
      const totalReviews = result.locations.reduce((sum, loc) => sum + loc.reviews_count, 0)
      const open24Hours = result.locations.filter(loc =>
        loc.working_hours?.includes('24') || loc.working_hours?.includes('Open 24')
      ).length

      setStats({
        totalLocations,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        open24Hours
      })
    } catch (error) {
      console.error('Failed to load initial data:', error)
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
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'McDonald\'s Near Me Directory',
      'description': 'Complete directory to find McDonald\'s near me, nearest McDonald\'s, closest McDonald\'s to my location.',
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
          ...(location.rating && {
            'aggregateRating': {
              '@type': 'AggregateRating',
              'ratingValue': location.rating,
              'reviewCount': location.reviews_count
            }
          })
        }))
      }
    }
  }

  const faqItems = [
    {
      question: 'How do I find the nearest McDonald\'s to my location?',
      answer: 'Use our McDonald\'s locator to find the nearest McDonald\'s. Simply enter your postcode or enable location services to instantly find the closest McDonald\'s restaurants near you with real-time distance and directions.'
    },
    {
      question: 'Are there 24 hour McDonald\'s near me?',
      answer: 'Yes, many McDonald\'s locations operate 24 hours. Our directory shows which McDonald\'s near you are open 24/7. Check individual restaurant pages for current McDonald\'s hours near me.'
    },
    {
      question: 'Can I order McDonald\'s online near me?',
      answer: 'Yes! Order McDonald\'s near me through McDelivery, DoorDash, Uber Eats, or Just Eat. Check each location for available delivery options.'
    },
    {
      question: 'How do I find McDonald\'s deals near me?',
      answer: 'Find McDonald\'s deals near me through our directory. Each McDonald\'s location page shows current promotions, app deals, and special offers available at that specific restaurant.'
    },
    {
      question: 'What\'s the closest McDonald\'s to me right now?',
      answer: 'Enable location services or enter your postcode to find the closest McDonald\'s to your current location. We\'ll show you the nearest McDonald\'s with distance, directions, and whether they\'re open now.'
    }
  ]

  const serviceCards = [
    { icon: Truck, title: 'McDelivery Near Me', description: 'Order McDonald\'s delivery near me through the official McDelivery service. Fast delivery to your location.', color: 'red' },
    { icon: Phone, title: 'DoorDash & Uber Eats', description: 'McDonald\'s DoorDash and Uber Eats available for quick online ordering and delivery.', color: 'yellow' },
    { icon: Clock, title: '24 Hour McDonald\'s', description: 'Find 24 hour McDonald\'s near me. Many locations open 24/7 for late-night cravings and early morning meals.', color: 'green' },
    { icon: Coffee, title: 'McCaf\u00e9 Near Me', description: 'Discover McDonald\'s with McCaf\u00e9 near me. Premium coffee, pastries, and specialty drinks available.', color: 'blue' }
  ]

  const colorMap: Record<string, string> = {
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600'
  }

  const featureCards = [
    { icon: Navigation, title: 'Find The Nearest McDonald\'s', description: 'Instantly locate the nearest McDonald\'s to your current location. Get precise directions with real-time distance calculations.', color: 'red' },
    { icon: Clock, title: 'McDonald\'s Hours Near Me', description: 'Check McDonald\'s hours including 24 hour locations. Know which McDonald\'s near me are open now.', color: 'yellow' },
    { icon: Star, title: 'McDonald\'s Deals Near Me', description: 'Find McDonald\'s deals and special offers at your nearest location. View ratings and reviews to choose the best restaurant.', color: 'green' }
  ]

  return (
    <>
      <SEOHead isHomePage={true} pageType="home" />
      <Layout seo={seoData}>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-red-600 to-red-700 text-white" aria-labelledby="hero-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <h1 id="hero-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
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

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12" role="list" aria-label="Directory statistics">
              <div role="listitem">
                <StatCard icon={MapPin} value={`${stats.totalLocations}+`} label="McDonald's Locations" />
              </div>
              <div role="listitem">
                <StatCard icon={Star} value={`${stats.averageRating}`} label="Average Rating" />
              </div>
              <div role="listitem">
                <StatCard icon={Users} value={`${stats.totalReviews.toLocaleString()}+`} label="Customer Reviews" />
              </div>
              <div role="listitem">
                <StatCard icon={Clock} value={`${stats.open24Hours}+`} label="24 Hour Locations" />
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-12 bg-gray-50" aria-labelledby="search-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 id="search-heading" className="text-3xl font-bold text-gray-900 mb-4">
                Find The Nearest McDonald's Near Me
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Search for McDonald's near me by postcode, city, or use GPS to find the closest McDonald's
                to your location. Get directions, check hours, and order online.
              </p>
            </div>

            <LocationSearch onLocationSelect={handleLocationSelect} />

            {/* Popular Searches */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-3">Popular searches:</p>
              <ul className="flex flex-wrap justify-center gap-2" aria-label="Popular search terms">
                {[
                  'McDonald\'s near me now',
                  'Closest McDonald\'s',
                  '24 hour McDonald\'s',
                  'McDonald\'s open near me',
                  'McDelivery near me',
                  'Nearest McDonald\'s',
                ].map((term) => (
                  <li key={term}>
                    <span className="inline-block px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-300">
                      {term}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-12" aria-labelledby="map-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 id="map-heading" className="text-3xl font-bold text-gray-900 mb-4">
                Interactive Map - McDonald's Locations Near Me
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Explore all McDonald's near me on our interactive map. Find the closest McDonald's
                to your location and get directions.
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
        <section className="py-16 bg-gray-50" aria-labelledby="services-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="services-heading" className="text-3xl font-bold text-gray-900 mb-4">
                McDonald's Services & Ordering Options
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Order McDonald's near me through multiple convenient options. Find McDonald's
                that delivers, 24 hour locations, and restaurants with McCaf&eacute;.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {serviceCards.map(card => (
                <article key={card.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorMap[card.color]}`} aria-hidden="true">
                    <card.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-gray-600">{card.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16" aria-labelledby="features-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="features-heading" className="text-3xl font-bold text-gray-900 mb-4">
                Why Use Our McDonald's Near Me Directory?
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                The most comprehensive tool to find McDonald's near me. Get accurate information
                about the nearest McDonald's and closest locations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featureCards.map(card => (
                <article key={card.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorMap[card.color]}`} aria-hidden="true">
                    <card.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-gray-600">{card.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Locations */}
        <section className="py-16 bg-gray-50" aria-labelledby="popular-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="popular-heading" className="text-3xl font-bold text-gray-900 mb-4">
                Popular McDonald's Locations Near Me
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Top-rated McDonald's restaurants near you. Find the closest McDonald's
                with the best reviews and 24 hour locations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.slice(0, 6).map((location) => (
                <article key={location.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                  {location.photo && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={location.photo}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{location.name}</h3>
                    <p className="text-gray-600 mb-3">{location.address}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      {location.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" aria-hidden="true" />
                          <span className="font-medium">{location.rating}</span>
                          <span>({location.reviews_count} reviews)</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${location.business_status === 'OPERATIONAL' ? 'bg-green-500' : 'bg-red-500'}`}
                          aria-hidden="true"
                        />
                        <span className={location.business_status === 'OPERATIONAL' ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                          {location.business_status === 'OPERATIONAL' ? 'Open' : 'Closed'}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/location/${location.slug}`}
                      className="inline-block w-full px-4 py-2 bg-red-600 text-white text-center font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      View Details & Directions
                      <span className="sr-only"> for {location.name}</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                to="/locations"
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                View All McDonald's Locations
                <ChevronRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16" aria-labelledby="faq-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="faq-heading" className="text-3xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600">
                Common questions about finding McDonald's near me
              </p>
            </div>

            <div className="space-y-4">
              {faqItems.map(item => (
                <FAQItem key={item.question} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        </section>
      </Layout>
    </>
  )
}
