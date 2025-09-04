import React, { useState, useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { LocationMap } from '@/components/LocationMap'
import { SEOHead } from '@/components/SEOHead'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { getLocationBySlug, McDonaldsLocation, parseWorkingHours, isLocationOpenNow, formatDistance } from '@/lib/supabase'
import { MapPin, Star, Phone, Clock, Globe, ExternalLink, Car, Utensils, Coffee, Users, Accessibility, Wifi, Truck, Navigation } from 'lucide-react'

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
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading McDonald's location...</span>
        </div>
      </Layout>
    )
  }

  if (error || !location) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">McDonald's Location Not Found</h1>
          <p className="text-gray-600 mb-8">
            {error || "The McDonald's near me location you're looking for doesn't exist or has been removed."}
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Find McDonald's Near Me
          </a>
        </div>
      </Layout>
    )
  }

  const isOpen = isLocationOpenNow(location.working_hours)
  const workingHours = parseWorkingHours(location.working_hours)
  const about = location.about || {}
  const is24Hour = location.working_hours?.includes('Open 24 hours')

  // Generate enhanced SEO data with comprehensive schema
  const seoData = {
    title: `${location.name} - McDonald's Near Me in ${location.city} | Nearest McDonald's Restaurant`,
    description: `${location.name} at ${location.address} - Closest McDonald's to you. ${location.rating ? `Rated ${location.rating}/5 with ${location.reviews_count} reviews.` : ''} ${is24Hour ? '24 hour McDonald\'s near me. ' : ''}McDonald's near me now ${isOpen ? 'open' : 'closed'}. Order McDonald's online, McDelivery, DoorDash, Uber Eats available. Get directions to the nearest McDonald's, check McDonald's hours near me.`,
    keywords: `mcdonald's near me ${location.city}, nearest mcdonald's ${location.city}, closest mcdonald's ${location.city}, mcdonald's ${location.postal_code}, mcdonald's near me now, mcdonald's open near me, mcdonald's hours near me, mcdonald's deals near me, order mcdonald's near me, mcdelivery near me, mcdonald's doordash near me, mcdonald's uber eats near me`,
    canonicalUrl: typeof window !== 'undefined' ? window.location.href : '',
    ogType: 'restaurant',
    ogImage: location.photo || '/images/mcdonalds-og-image.jpg',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'FastFoodRestaurant',
      '@id': typeof window !== 'undefined' ? `${window.location.href}#restaurant` : '',
      'name': location.name,
      'image': location.photo ? [location.photo] : [],
      'description': `McDonald's restaurant near me at ${location.address}. ${is24Hour ? '24 hour McDonald\'s location. ' : ''}Find the nearest McDonald's, get directions to the closest McDonald's, order McDonald's online.`,
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
          return {
            '@type': 'OpeningHoursSpecification',
            'dayOfWeek': `https://schema.org/${day}`,
            'opens': '00:00',
            'closes': '23:59'
          }
        }
        const [open, close] = hours.split(' - ')
        return {
          '@type': 'OpeningHoursSpecification', 
          'dayOfWeek': `https://schema.org/${day}`,
          'opens': open,
          'closes': close
        }
      }),
      'servesCuisine': 'Fast Food, Burgers, American',
      'priceRange': '$',
      'paymentAccepted': 'Cash, Credit Card, Debit Card, NFC Mobile Payments',
      'currenciesAccepted': 'GBP',
      'aggregateRating': location.rating ? {
        '@type': 'AggregateRating',
        'ratingValue': location.rating,
        'reviewCount': location.reviews_count,
        'bestRating': '5',
        'worstRating': '1'
      } : undefined,
      'brand': {
        '@type': 'Brand',
        'name': 'McDonald\'s'
      },
      'parentOrganization': {
        '@type': 'Corporation',
        'name': 'McDonald\'s Corporation',
        'url': 'https://www.mcdonalds.com'
      },
      'hasMenu': 'https://www.mcdonalds.com/gb/en-gb/menu.html',
      'acceptsReservations': false,
      ...(about['Service options'] && {
        'takeaway': about['Service options']['Takeaway'],
        'dineIn': about['Service options']['Dine-in'],
        'delivery': about['Service options']['Delivery']
      }),
      ...(about.Accessibility && {
        'isAccessibleForFree': true,
        'wheelchairAccessible': about.Accessibility['Wheelchair-accessible entrance']
      }),
      'amenityFeature': [
        { '@type': 'LocationFeatureSpecification', 'name': 'Wi-Fi', 'value': about.Amenities?.['Wi-Fi'] || false },
        { '@type': 'LocationFeatureSpecification', 'name': 'Parking', 'value': true },
        { '@type': 'LocationFeatureSpecification', 'name': 'Drive-Thru', 'value': about['Service options']?.['Drive-through'] || false },
        { '@type': 'LocationFeatureSpecification', 'name': 'McCafé', 'value': true }
      ]
    }
  }

  return (
    <>
      <SEOHead location={location} pageType="location" />
      <Layout seo={seoData}>
        {/* Breadcrumb Navigation */}
        <section className="bg-gray-50 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <a href="/" className="hover:text-red-600">McDonald's Near Me</a>
                </li>
                <li>
                  <span className="mx-2">/</span>
                </li>
                <li>
                  <a href="/locations" className="hover:text-red-600">All Locations</a>
                </li>
                <li>
                  <span className="mx-2">/</span>
                </li>
                <li className="text-gray-900 font-medium">{location.name}</li>
              </ol>
            </nav>
          </div>
        </section>

        {/* Header Section with Enhanced Keywords */}
        <section className="bg-gray-50 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Location Info */}
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {location.name} - McDonald's Near Me
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  Nearest McDonald's Restaurant in {location.city}
                </p>
                
                <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{location.address}</span>
                  </div>
                  
                  {location.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="font-medium">{location.rating}</span>
                      <span>({location.reviews_count} reviews)</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${location.business_status === 'OPERATIONAL' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={`font-medium ${location.business_status === 'OPERATIONAL' ? 'text-green-600' : 'text-red-600'}`}>
                      {location.business_status === 'OPERATIONAL' ? (isOpen ? 'McDonald\'s Open Now' : 'Closed Now') : 'Temporarily Closed'}
                    </span>
                  </div>
                  
                  {is24Hour && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-600">24 Hour McDonald's</span>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                    aria-label="Get directions to nearest McDonald's"
                  >
                    <Car className="h-5 w-5 mr-2" />
                    Get Directions to McDonald's
                  </a>
                  
                  {location.phone && (
                    <a
                      href={`tel:${location.phone}`}
                      className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      aria-label="Call McDonald's near me"
                    >
                      <Phone className="h-5 w-5 mr-2" />
                      Call McDonald's
                    </a>
                  )}
                  
                  <a
                    href="https://www.mcdonalds.com/gb/en-gb/mcdelivery.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors"
                    aria-label="Order McDonald's online near me"
                  >
                    <Truck className="h-5 w-5 mr-2" />
                    Order McDonald's Online
                  </a>
                </div>
              </div>
              
              {/* Location Photo */}
              {location.photo && (
                <div className="lg:w-96">
                  <img
                    src={location.photo}
                    alt={`${location.name} - McDonald's near me in ${location.city}`}
                    className="w-full h-64 lg:h-80 object-cover rounded-xl shadow-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Details Section with Keywords */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Working Hours */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    McDonald's Hours Near Me
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(workingHours).map(([day, hours]) => {
                      const today = new Date()
                      const currentDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()]
                      const isToday = day === currentDayName
                      
                      return (
                        <div key={day} className={`flex justify-between p-3 rounded-lg transition-colors ${
                          isToday 
                            ? 'bg-red-50 border-2 border-red-200 shadow-sm' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}>
                          <span className={`font-medium ${
                            isToday 
                              ? 'text-red-900' 
                              : 'text-gray-700'
                          }`}>
                            {day}
                            {isToday && (
                              <span className="ml-2 text-xs bg-red-600 text-white px-2 py-1 rounded-full">
                                Today
                              </span>
                            )}
                          </span>
                          <span className={`${
                            isToday 
                              ? 'text-red-700 font-medium' 
                              : 'text-gray-600'
                          }`}>
                            {hours}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  
                  {is24Hour && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 font-medium">
                        ⏰ This is a 24 hour McDonald's location - Open all day, every day!
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Services & Amenities */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    McDonald's Services & Amenities
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Delivery Options */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Order McDonald's Near Me
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="flex items-center gap-2 p-2 rounded text-green-700 bg-green-50">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span className="text-sm">McDelivery</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded text-green-700 bg-green-50">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span className="text-sm">DoorDash</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded text-green-700 bg-green-50">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span className="text-sm">Uber Eats</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded text-green-700 bg-green-50">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span className="text-sm">Just Eat</span>
                        </div>
                      </div>
                    </div>
                    
                    {about['Service options'] && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Utensils className="h-4 w-4" />
                          Service Options
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(about['Service options']).map(([service, available]) => (
                            <div key={service} className={`flex items-center gap-2 p-2 rounded ${available ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-50'}`}>
                              <div className={`h-2 w-2 rounded-full ${available ? 'bg-green-500' : 'bg-gray-400'}`} />
                              <span className="text-sm">{service}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {about.Amenities && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Wifi className="h-4 w-4" />
                          Amenities
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(about.Amenities).map(([amenity, available]) => (
                            <div key={amenity} className={`flex items-center gap-2 p-2 rounded ${available ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-50'}`}>
                              <div className={`h-2 w-2 rounded-full ${available ? 'bg-green-500' : 'bg-gray-400'}`} />
                              <span className="text-sm">{amenity}</span>
                            </div>
                          ))}
                          <div className="flex items-center gap-2 p-2 rounded text-green-700 bg-green-50">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-sm">McCafé</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {about.Accessibility && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Accessibility className="h-4 w-4" />
                          Accessibility
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries(about.Accessibility).map(([feature, available]) => (
                            <div key={feature} className={`flex items-center gap-2 p-2 rounded ${available ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                              <div className={`h-2 w-2 rounded-full ${available ? 'bg-green-500' : 'bg-red-500'}`} />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {about.Children && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Family Features
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(about.Children).map(([feature, available]) => (
                            <div key={feature} className={`flex items-center gap-2 p-2 rounded ${available ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-50'}`}>
                              <div className={`h-2 w-2 rounded-full ${available ? 'bg-green-500' : 'bg-gray-400'}`} />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Map */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Find This McDonald's Near Me on Map
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Get directions to the nearest McDonald's at {location.address}
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
              <div className="space-y-6">
                {/* Contact Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    McDonald's Contact Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900">McDonald's Address</div>
                        <div className="text-gray-600 text-sm">{location.address}</div>
                        <div className="text-gray-500 text-xs mt-1">{location.city}, {location.postal_code}</div>
                      </div>
                    </div>
                    
                    {location.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">Phone</div>
                          <a href={`tel:${location.phone}`} className="text-red-600 hover:text-red-700 text-sm">
                            {location.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Order Online</div>
                        <a 
                          href="https://www.mcdonalds.com/gb/en-gb/mcdelivery.html" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                        >
                          McDelivery <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-4">
                    Quick Actions - McDonald's Near Me
                  </h3>
                  
                  <div className="space-y-3">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-white rounded-lg text-gray-700 hover:text-red-600 transition-colors"
                      aria-label="Get directions to nearest McDonald's"
                    >
                      <Navigation className="h-5 w-5" />
                      <span className="font-medium">Directions to McDonald's</span>
                    </a>
                    
                    {location.phone && (
                      <a
                        href={`tel:${location.phone}`}
                        className="flex items-center gap-2 p-3 bg-white rounded-lg text-gray-700 hover:text-red-600 transition-colors"
                        aria-label="Call McDonald's near me"
                      >
                        <Phone className="h-5 w-5" />
                        <span className="font-medium">Call McDonald's</span>
                      </a>
                    )}
                    
                    <a
                      href="https://www.mcdonalds.com/gb/en-gb/mcdelivery.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-white rounded-lg text-gray-700 hover:text-red-600 transition-colors"
                      aria-label="Order McDonald's online near me"
                    >
                      <Truck className="h-5 w-5" />
                      <span className="font-medium">Order McDonald's Online</span>
                    </a>
                    
                    {location.reviews_link && (
                      <a
                        href={location.reviews_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-white rounded-lg text-gray-700 hover:text-red-600 transition-colors"
                      >
                        <Star className="h-5 w-5" />
                        <span className="font-medium">Read Reviews</span>
                      </a>
                    )}
                  </div>
                </div>
                
                {/* Delivery Partners */}
                <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Order McDonald's Near Me
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Order from this McDonald's location through:
                  </p>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">• McDelivery</div>
                    <div className="text-sm font-medium text-gray-700">• McDonald's DoorDash</div>
                    <div className="text-sm font-medium text-gray-700">• McDonald's Uber Eats</div>
                    <div className="text-sm font-medium text-gray-700">• McDonald's Just Eat</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* SEO Content Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              About This McDonald's Location
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-4">
                Looking for McDonald's near me? This {location.name} is one of the nearest McDonald's 
                restaurants to your location in {location.city}. Located at {location.address}, 
                this is the closest McDonald's for residents and visitors in the {location.postal_code} area.
              </p>
              
              {is24Hour && (
                <p className="text-gray-600 mb-4">
                  This is a <strong>24 hour McDonald's location</strong>, perfect for late-night cravings 
                  or early morning breakfast. Whether you need McDonald's near me now at 3am or 
                  McDonald's open near me on holidays, this location has you covered.
                </p>
              )}
              
              <p className="text-gray-600 mb-4">
                Order McDonald's near me for delivery or collection. This McDonald's location offers 
                multiple ordering options including McDelivery near me, McDonald's DoorDash near me, 
                McDonald's Uber Eats near me, and McDonald's Just Eat near me. You can also order 
                McDonald's online near me through the official McDonald's app.
              </p>
              
              <p className="text-gray-600 mb-4">
                To find the closest McDonald's to your current location, use our interactive map above 
                or click "Get Directions to McDonald's" for turn-by-turn navigation. Check McDonald's 
                hours near me in the opening times section to see when this McDonald's near me is open.
              </p>
              
              {location.rating && location.rating >= 4 && (
                <p className="text-gray-600 mb-4">
                  With a rating of {location.rating} stars from {location.reviews_count} customer reviews, 
                  this is one of the highest-rated McDonald's restaurants near me. Customers appreciate 
                  the service, food quality, and convenient location.
                </p>
              )}
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                Find More McDonald's Near Me
              </h3>
              <p className="text-gray-600">
                Looking for other McDonald's locations near me? Use our McDonald's directory to find 
                the nearest McDonald's, closest McDonald's to my location, or search for specific 
                features like 24 hour McDonald's near me, McDonald's with McCafé near me, or 
                McDonald's with drive-thru near me. We help you find McDonald's near me now open, 
                McDonald's deals near me, and provide McDonald's hours near me for all locations.
              </p>
            </div>
          </div>
        </section>
      </Layout>
    </>
  )
}
