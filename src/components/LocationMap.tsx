import React, { useState, useCallback, useRef } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, MarkerClusterer } from '@react-google-maps/api'
import { McDonaldsLocation, formatDistance } from '@/lib/supabase'
import { Star, MapPin, Phone, Clock, ExternalLink } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface LocationMapProps {
  locations: McDonaldsLocation[]
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string
  onLocationSelect?: (location: McDonaldsLocation) => void
}

const mapContainerStyle = {
  width: '100%',
  height: '600px'
}

const defaultCenter = {
  lat: 51.5074, // London center
  lng: -0.1278
}

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
}

export function LocationMap({ locations, center, zoom = 11, height = '600px', onLocationSelect }: LocationMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<McDonaldsLocation | null>(null)
  const [mapCenter, setMapCenter] = useState(center || defaultCenter)
  const mapRef = useRef<google.maps.Map | null>(null)
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk',
    libraries: ['places']
  })

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
    
    // Fit bounds to show all locations
    if (locations.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      locations.forEach(location => {
        bounds.extend({ lat: location.latitude, lng: location.longitude })
      })
      map.fitBounds(bounds)
    }
  }, [locations])

  const onUnmount = useCallback(() => {
    mapRef.current = null
  }, [])

  const handleMarkerClick = (location: McDonaldsLocation) => {
    setSelectedLocation(location)
    onLocationSelect?.(location)
  }

  const handleInfoWindowClose = () => {
    setSelectedLocation(null)
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Map unavailable</h3>
          <p className="text-gray-600">Unable to load the map. Please try again later.</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border border-gray-200">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading map...</span>
      </div>
    )
  }

  return (
    <div className="w-full" style={{ height }}>
      <GoogleMap
        mapContainerStyle={{ ...mapContainerStyle, height }}
        center={mapCenter}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        <MarkerClusterer
          options={{
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
            gridSize: 60,
            maxZoom: 15
          }}
        >
          {(clusterer) => (
            <>
              {locations.map((location) => (
                <Marker
                  key={location.id}
                  position={{ lat: location.latitude, lng: location.longitude }}
                  clusterer={clusterer}
                  onClick={() => handleMarkerClick(location)}
                  icon={{
                    url: '/images/mcdonalds-marker.svg',
                    scaledSize: new google.maps.Size(32, 32),
                    anchor: new google.maps.Point(16, 32)
                  }}
                  title={location.name}
                />
              ))}
            </>
          )}
        </MarkerClusterer>

        {selectedLocation && (
          <InfoWindow
            position={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
            onCloseClick={handleInfoWindowClose}
            options={{ pixelOffset: new google.maps.Size(0, -32) }}
          >
            <LocationInfoWindow location={selectedLocation} />
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}

interface LocationInfoWindowProps {
  location: McDonaldsLocation
}

function LocationInfoWindow({ location }: LocationInfoWindowProps) {
  const isOpen = location.business_status === 'OPERATIONAL'
  
  return (
    <div className="p-3 max-w-sm">
      <div className="flex items-start gap-3 mb-3">
        {location.photo && (
          <img
            src={location.photo}
            alt={location.name}
            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{location.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{location.address}</p>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        {/* Rating */}
        {location.rating && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="font-medium">{location.rating}</span>
            <span className="text-gray-500">({location.reviews_count})</span>
          </div>
        )}
        
        {/* Status */}
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className={`text-sm ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
            {isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
        
        {/* Distance */}
        {location.distance && (
          <div className="flex items-center gap-1 text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>{formatDistance(location.distance)}</span>
          </div>
        )}
        
        {/* Phone */}
        {location.phone && (
          <div className="flex items-center gap-1 text-gray-500">
            <Phone className="h-4 w-4" />
            <a href={`tel:${location.phone}`} className="hover:text-blue-600">
              {location.phone}
            </a>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
        <a
          href={`/location/${location.slug}`}
          className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded text-center hover:bg-red-700 transition-colors"
        >
          View Details
        </a>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
        >
          <ExternalLink className="h-3 w-3" />
          Directions
        </a>
      </div>
    </div>
  )
}