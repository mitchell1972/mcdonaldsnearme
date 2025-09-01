import React, { useState, useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { LocationMap } from '@/components/LocationMap'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { getLocationBySlug, McDonaldsLocation, parseWorkingHours, isLocationOpenNow, formatDistance } from '@/lib/supabase'
import { MapPin, Star, Phone, Clock, Globe, ExternalLink, Car, Utensils, Coffee, Users, Accessibility, Wifi } from 'lucide-react'

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
          <span className="ml-3 text-gray-600">Loading location...</span>
        </div>
      </Layout>
    )
  }

  if (error || !location) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Location Not Found</h1>
          <p className="text-gray-600 mb-8">
            {error || "The McDonald's location you're looking for doesn't exist or has been removed."}
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Return Home
          </a>
        </div>
      </Layout>
    )
  }

  const isOpen = isLocationOpenNow(location.working_hours)
  const workingHours = parseWorkingHours(location.working_hours)
  const about = location.about || {}

  // Generate SEO data with LocalBusiness schema
  const seoData = {
    title: `${location.name} - ${location.address} | McDonald's Directory`,
    description: `Visit ${location.name} at ${location.address}. ${location.rating ? `Rated ${location.rating}/5 with ${location.reviews_count} reviews.` : ''} Get opening hours, directions, and contact information.`,
    canonicalUrl: typeof window !== 'undefined' ? window.location.href : '',
    ogType: 'restaurant',
    ogImage: location.photo || '/images/mcdonalds-og-image.jpg',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      'name': location.name,
      'image': location.photo ? [location.photo] : [],
      'description': `McDonald's restaurant located at ${location.address}`,
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
      'servesCuisine': 'Fast Food',
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
        'name': 'McDonald\'s Corporation'
      },
      ...(about['Service options'] && {
        'hasMenu': true,
        'takeaway': about['Service options']['Takeaway'],
        'dineIn': about['Service options']['Dine-in'],
        'delivery': about['Service options']['Delivery']
      }),
      ...(about.Accessibility && {
        'isAccessibleForFree': true,
        'wheelchairAccessible': about.Accessibility['Wheelchair-accessible entrance']
      })
    }
  }

  return (
    <Layout seo={seoData}>
      {/* Header Section */}
      <section className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Location Info */}
            <div className="flex-1">
              <div className="mb-4">
                <nav className="text-sm text-gray-500">
                  <a href="/" className="hover:text-red-600">Home</a>
                  <span className="mx-2">/</span>
                  <span>Location Details</span>
                </nav>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {location.name}
              </h1>
              
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
                    {location.business_status === 'OPERATIONAL' ? (isOpen ? 'Open Now' : 'Closed Now') : 'Temporarily Closed'}
                  </span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Car className="h-5 w-5 mr-2" />
                  Get Directions
                </a>
                
                {location.phone && (
                  <a
                    href={`tel:${location.phone}`}
                    className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Call Now
                  </a>
                )}
                
                {location.website && (
                  <a
                    href={location.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    <Globe className="h-5 w-5 mr-2" />
                    Visit Website
                  </a>
                )}
              </div>
            </div>
            
            {/* Location Photo */}
            {location.photo && (
              <div className="lg:w-96">
                <img
                  src={location.photo}
                  alt={location.name}
                  className="w-full h-64 lg:h-80 object-cover rounded-xl shadow-lg"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Working Hours */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Opening Hours
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
              </div>
              
              {/* Services & Amenities */}
              {Object.keys(about).length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Services & Amenities</h2>
                  
                  <div className="space-y-6">
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
              )}
              
              {/* Map */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Location on Map</h2>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">Address</div>
                      <div className="text-gray-600 text-sm">{location.address}</div>
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
                  
                  {location.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Website</div>
                        <a 
                          href={location.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                        >
                          Visit Site <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-4">Quick Actions</h3>
                
                <div className="space-y-3">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-white rounded-lg text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <Car className="h-5 w-5" />
                    <span className="font-medium">Get Directions</span>
                  </a>
                  
                  {location.phone && (
                    <a
                      href={`tel:${location.phone}`}
                      className="flex items-center gap-2 p-3 bg-white rounded-lg text-gray-700 hover:text-red-600 transition-colors"
                    >
                      <Phone className="h-5 w-5" />
                      <span className="font-medium">Call Restaurant</span>
                    </a>
                  )}
                  
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
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}