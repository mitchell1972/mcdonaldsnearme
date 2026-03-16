import { useState, useEffect } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { LocationMap } from '@/components/LocationMap'
import { SEOHead } from '@/components/SEOHead'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { getLocationBySlug, McDonaldsLocation, parseWorkingHours, isLocationOpenNow, formatDistance } from '@/lib/supabase'
import { MapPin, Star, Phone, Clock, Globe, ExternalLink, Car, Utensils, Coffee, Users, Accessibility, Wifi, Truck, Navigation, ChevronRight } from 'lucide-react'

function StatusBadge({ isOpen, is24Hour }: { isOpen: boolean; is24Hour: boolean }) {
  if (is24Hour) {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 font-medium text-sm">
        <Clock className="h-4 w-4" aria-hidden="true" />
        24 Hour McDonald's
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-medium text-sm ${
      isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
    }`}>
      <span
        className={`h-2 w-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-gray-400'}`}
        aria-hidden="true"
      />
      {isOpen ? 'Open Now' : 'Closed Now'}
    </span>
  )
}

function FeatureTag({ label, available }: { label: string; available: boolean }) {
  return (
    <div className={`flex items-center gap-2 p-2 rounded text-sm ${
      available ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-50'
    }`}>
      <span
        className={`h-2 w-2 rounded-full flex-shrink-0 ${available ? 'bg-green-500' : 'bg-gray-400'}`}
        aria-hidden="true"
      />
      <span>{label}</span>
      <span className="sr-only">: {available ? 'Available' : 'Not available'}</span>
    </div>
  )
}

export function LocationPage() {
  const { slug } = useParams<{ slug: string }>()
  const [location, setLocation] = useState<McDonaldsLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    loadLocation()
  }, [slug])

  const loadLocation = async () => {
    if (!slug) return
    try {
      const locationData = await getLocationBySlug(slug)
      setLocation(locationData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load location')
    } finally {
      setLoading(false)
    }
  }

  if (!slug) {
    return <Navigate to="/" replace />
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96" role="status">
          <LoadingSpinner size="lg" label="Loading McDonald's location" />
        </div>
      </Layout>
    )
  }

  if (error || !location) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center" role="alert">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">McDonald's Location Not Found</h1>
          <p className="text-gray-600 mb-8">
            {error || "The McDonald's location you're looking for doesn't exist or has been removed."}
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Find McDonald's Near Me
          </Link>
        </div>
      </Layout>
    )
  }

  const isOpen = isLocationOpenNow(location.working_hours)
  const workingHours = parseWorkingHours(location.working_hours)
  const about = location.about || {}
  const is24Hour = location.working_hours?.includes('Open 24 hours')

  const seoData = {
    title: `${location.name} - McDonald's Near Me in ${location.city} | Nearest McDonald's`,
    description: `${location.name} at ${location.address}. ${location.rating ? `Rated ${location.rating}/5 with ${location.reviews_count} reviews.` : ''} ${is24Hour ? '24 hour McDonald\'s. ' : ''}Get directions, order online, check hours.`,
    canonicalUrl: typeof window !== 'undefined' ? window.location.href : '',
    ogType: 'restaurant',
    ogImage: location.photo || '/images/mcdonalds-og-image.jpg',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'FastFoodRestaurant',
      '@id': typeof window !== 'undefined' ? `${window.location.href}#restaurant` : '',
      'name': location.name,
      'image': location.photo ? [location.photo] : [],
      'description': `McDonald's restaurant at ${location.address}. ${is24Hour ? '24 hour location. ' : ''}`,
      'url': typeof window !== 'undefined' ? window.location.href : '',
      'telephone': location.phone,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': location.address,
        'addressLocality': location.city,
        'postalCode': location.postal_code,
        'addressCountry': 'GB',
        'addressRegion': 'England'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': location.latitude,
        'longitude': location.longitude
      },
      'openingHoursSpecification': Object.entries(workingHours).map(([day, hours]) => {
        if (hours === 'Open 24 hours') {
          return { '@type': 'OpeningHoursSpecification', 'dayOfWeek': `https://schema.org/${day}`, 'opens': '00:00', 'closes': '23:59' }
        }
        const [open, close] = hours.split(' - ')
        return { '@type': 'OpeningHoursSpecification', 'dayOfWeek': `https://schema.org/${day}`, 'opens': open, 'closes': close }
      }),
      'servesCuisine': 'Fast Food, Burgers, American',
      'priceRange': '$',
      'paymentAccepted': 'Cash, Credit Card, Debit Card, NFC Mobile Payments',
      'currenciesAccepted': 'GBP',
      ...(location.rating && {
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': location.rating,
          'reviewCount': location.reviews_count,
          'bestRating': '5',
          'worstRating': '1'
        }
      }),
      'brand': { '@type': 'Brand', 'name': 'McDonald\'s' },
      'parentOrganization': { '@type': 'Corporation', 'name': 'McDonald\'s Corporation', 'url': 'https://www.mcdonalds.com' },
      'hasMenu': 'https://www.mcdonalds.com/gb/en-gb/menu.html',
      'acceptsReservations': false
    }
  }

  const currentDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()]

  return (
    <>
      <SEOHead location={location} pageType="location" />
      <Layout seo={seoData}>
        {/* Breadcrumb Navigation */}
        <section className="bg-gray-50 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center space-x-1 text-sm text-gray-500">
                <li>
                  <Link to="/" className="hover:text-red-600 transition-colors">McDonald's Near Me</Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="h-4 w-4 mx-1" />
                </li>
                <li>
                  <Link to="/locations" className="hover:text-red-600 transition-colors">All Locations</Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="h-4 w-4 mx-1" />
                </li>
                <li aria-current="page" className="text-gray-900 font-medium truncate max-w-[200px]">
                  {location.name}
                </li>
              </ol>
            </nav>
          </div>
        </section>

        {/* Header Section */}
        <section className="bg-gray-50 pb-8" aria-labelledby="location-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <h1 id="location-heading" className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {location.name}
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  McDonald's Restaurant in {location.city}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    <span>{location.address}</span>
                  </div>

                  {location.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" aria-hidden="true" />
                      <span className="font-medium">{location.rating}</span>
                      <span className="sr-only">out of 5 stars,</span>
                      <span>({location.reviews_count} reviews)</span>
                    </div>
                  )}

                  <StatusBadge isOpen={isOpen} is24Hour={!!is24Hour} />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Car className="h-5 w-5 mr-2" aria-hidden="true" />
                    Get Directions
                    <span className="sr-only"> to {location.name} (opens in Google Maps)</span>
                  </a>

                  {location.phone && (
                    <a
                      href={`tel:${location.phone}`}
                      className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Phone className="h-5 w-5 mr-2" aria-hidden="true" />
                      Call {location.phone}
                    </a>
                  )}

                  <a
                    href="https://www.mcdonalds.com/gb/en-gb/mcdelivery.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    <Truck className="h-5 w-5 mr-2" aria-hidden="true" />
                    Order Online
                    <span className="sr-only"> (opens McDelivery website)</span>
                  </a>
                </div>
              </div>

              {/* Location Photo */}
              {location.photo && (
                <div className="lg:w-96">
                  <img
                    src={location.photo}
                    alt={`${location.name} restaurant exterior`}
                    className="w-full h-64 lg:h-80 object-cover rounded-xl shadow-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Details Section */}
        <section className="py-12" aria-labelledby="details-heading">
          <h2 id="details-heading" className="sr-only">Location Details</h2>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Working Hours */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5" aria-hidden="true" />
                    Opening Hours
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="list" aria-label="Weekly opening hours">
                    {Object.entries(workingHours).map(([day, hours]) => {
                      const isToday = day === currentDayName
                      return (
                        <div
                          key={day}
                          role="listitem"
                          className={`flex justify-between p-3 rounded-lg transition-colors ${
                            isToday
                              ? 'bg-red-50 border-2 border-red-200 shadow-sm'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          aria-current={isToday ? 'date' : undefined}
                        >
                          <span className={`font-medium ${isToday ? 'text-red-900' : 'text-gray-700'}`}>
                            {day}
                            {isToday && (
                              <span className="ml-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
                                Today
                              </span>
                            )}
                          </span>
                          <span className={isToday ? 'text-red-700 font-medium' : 'text-gray-600'}>
                            {hours}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {is24Hour && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg" role="note">
                      <p className="text-sm text-yellow-800 font-medium">
                        This is a 24 hour McDonald's location - Open all day, every day!
                      </p>
                    </div>
                  )}
                </div>

                {/* Services & Amenities */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Services & Amenities
                  </h3>

                  <div className="space-y-6">
                    {/* Delivery Options */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Truck className="h-4 w-4" aria-hidden="true" />
                        Delivery & Ordering
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {['McDelivery', 'DoorDash', 'Uber Eats', 'Just Eat'].map(service => (
                          <FeatureTag key={service} label={service} available={true} />
                        ))}
                      </div>
                    </div>

                    {about['Service options'] && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Utensils className="h-4 w-4" aria-hidden="true" />
                          Service Options
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(about['Service options']).map(([service, available]) => (
                            <FeatureTag key={service} label={service} available={available as boolean} />
                          ))}
                        </div>
                      </div>
                    )}

                    {about.Amenities && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Wifi className="h-4 w-4" aria-hidden="true" />
                          Amenities
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(about.Amenities).map(([amenity, available]) => (
                            <FeatureTag key={amenity} label={amenity} available={available as boolean} />
                          ))}
                          <FeatureTag label="McCaf&eacute;" available={true} />
                        </div>
                      </div>
                    )}

                    {about.Accessibility && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Accessibility className="h-4 w-4" aria-hidden="true" />
                          Accessibility
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries(about.Accessibility).map(([feature, available]) => (
                            <FeatureTag key={feature} label={feature} available={available as boolean} />
                          ))}
                        </div>
                      </div>
                    )}

                    {about.Children && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4" aria-hidden="true" />
                          Family Features
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(about.Children).map(([feature, available]) => (
                            <FeatureTag key={feature} label={feature} available={available as boolean} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Map */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Location on Map
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Get directions to {location.name} at {location.address}
                    </p>
                  </div>
                  <LocationMap
                    locations={[location]}
                    center={{ lat: location.latitude, lng: location.longitude }}
                    zoom={15}
                    height="400px"
                  />
                </div>
              </div>

              {/* Sidebar */}
              <aside className="space-y-6" aria-label="Contact and quick actions">
                {/* Contact Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Contact Information
                  </h3>

                  <dl className="space-y-4">
                    <div className="flex items-start gap-3">
                      <dt className="sr-only">Address</dt>
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <dd>
                        <div className="font-medium text-gray-900">Address</div>
                        <div className="text-gray-600 text-sm">{location.address}</div>
                        <div className="text-gray-500 text-xs mt-1">{location.city}, {location.postal_code}</div>
                      </dd>
                    </div>

                    {location.phone && (
                      <div className="flex items-center gap-3">
                        <dt className="sr-only">Phone</dt>
                        <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
                        <dd>
                          <div className="font-medium text-gray-900">Phone</div>
                          <a href={`tel:${location.phone}`} className="text-red-600 hover:text-red-700 text-sm">
                            {location.phone}
                          </a>
                        </dd>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <dt className="sr-only">Order Online</dt>
                      <Globe className="h-5 w-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
                      <dd>
                        <div className="font-medium text-gray-900">Order Online</div>
                        <a
                          href="https://www.mcdonalds.com/gb/en-gb/mcdelivery.html"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-700 text-sm inline-flex items-center gap-1"
                        >
                          McDelivery <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          <span className="sr-only">(opens in new tab)</span>
                        </a>
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Quick Actions */}
                <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-4">
                    Quick Actions
                  </h3>

                  <nav className="space-y-3" aria-label="Quick actions">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-white rounded-lg text-gray-700 hover:text-red-600 transition-colors"
                    >
                      <Navigation className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                      <span className="font-medium">Get Directions</span>
                      <span className="sr-only">(opens in Google Maps)</span>
                    </a>

                    {location.phone && (
                      <a
                        href={`tel:${location.phone}`}
                        className="flex items-center gap-2 p-3 bg-white rounded-lg text-gray-700 hover:text-red-600 transition-colors"
                      >
                        <Phone className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                        <span className="font-medium">Call Restaurant</span>
                      </a>
                    )}

                    <a
                      href="https://www.mcdonalds.com/gb/en-gb/mcdelivery.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-white rounded-lg text-gray-700 hover:text-red-600 transition-colors"
                    >
                      <Truck className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                      <span className="font-medium">Order Online</span>
                      <span className="sr-only">(opens in new tab)</span>
                    </a>

                    {location.reviews_link && (
                      <a
                        href={location.reviews_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-white rounded-lg text-gray-700 hover:text-red-600 transition-colors"
                      >
                        <Star className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                        <span className="font-medium">Read Reviews</span>
                        <span className="sr-only">(opens in new tab)</span>
                      </a>
                    )}
                  </nav>
                </div>

                {/* Delivery Partners */}
                <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Order for Delivery
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Order from this location through:
                  </p>
                  <ul className="space-y-2" aria-label="Delivery partners">
                    {['McDelivery', 'DoorDash', 'Uber Eats', 'Just Eat'].map(partner => (
                      <li key={partner} className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" aria-hidden="true" />
                        {partner}
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-12 bg-gray-50" aria-labelledby="about-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="about-heading" className="text-2xl font-bold text-gray-900 mb-6">
              About This McDonald's Location
            </h2>
            <div className="prose prose-gray max-w-none space-y-4">
              <p className="text-gray-600">
                This {location.name} is located in {location.city} at {location.address},
                serving the {location.postal_code} area.
              </p>

              {is24Hour && (
                <p className="text-gray-600">
                  This is a <strong>24 hour McDonald's location</strong>, perfect for late-night cravings
                  or early morning breakfast.
                </p>
              )}

              <p className="text-gray-600">
                Order for delivery or collection through McDelivery, DoorDash,
                Uber Eats, or Just Eat. You can also order through the official McDonald's app.
              </p>

              <p className="text-gray-600">
                Use the interactive map above or click "Get Directions" for turn-by-turn navigation.
                Check the opening hours section to plan your visit.
              </p>

              {location.rating && location.rating >= 4 && (
                <p className="text-gray-600">
                  With a rating of <strong>{location.rating} stars</strong> from {location.reviews_count} customer reviews,
                  this is one of the highest-rated McDonald's in the area.
                </p>
              )}

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                Find More Locations
              </h3>
              <p className="text-gray-600">
                Looking for other McDonald's locations? Use our{' '}
                <Link to="/" className="text-red-600 hover:text-red-700 underline">
                  McDonald's directory
                </Link>{' '}
                to search by postcode, city, or use GPS to find restaurants near you.
              </p>
            </div>
          </div>
        </section>
      </Layout>
    </>
  )
}
