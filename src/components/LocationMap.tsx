import { useState, useCallback, useRef } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, MarkerClusterer } from '@react-google-maps/api'
import { Link } from 'react-router-dom'
import { McDonaldsLocation, formatDistance } from '@/lib/supabase'
import { Star, MapPin, Phone, ExternalLink } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface LocationMapProps {
  locations: McDonaldsLocation[]
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string
  onLocationSelect?: (location: McDonaldsLocation) => void
}

const defaultCenter = {
  lat: 51.5074,
  lng: -0.1278
}

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
}

export function LocationMap({ locations, center, zoom = 11, height = '600px', onLocationSelect }: LocationMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<McDonaldsLocation | null>(null)
  const [mapCenter] = useState(center || defaultCenter)
  const mapRef = useRef<google.maps.Map | null>(null)

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk',
    libraries: ['places']
  })

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
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

  if (loadError) {
    return (
      <div className="flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200" style={{ height }} role="alert">
        <div className="text-center p-8">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Map unavailable</h3>
          <p className="text-gray-600">Unable to load the map. Please try again later.</p>
          <div className="sr-only">
            <h4>Location list:</h4>
            <ul>
              {locations.map(loc => (
                <li key={loc.id}>{loc.name} - {loc.address}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200" style={{ height }}>
        <LoadingSpinner size="lg" label="Loading map" />
      </div>
    )
  }

  return (
    <div className="w-full" style={{ height }}>
      <div className="sr-only" role="region" aria-label="Map showing McDonald's locations">
        <p>Interactive map displaying {locations.length} McDonald's locations.</p>
        <ul>
          {locations.slice(0, 10).map(loc => (
            <li key={loc.id}>
              {loc.name} at {loc.address}
              {loc.rating && `, rated ${loc.rating} out of 5`}
              {loc.distance && `, ${formatDistance(loc.distance)} away`}
            </li>
          ))}
          {locations.length > 10 && <li>and {locations.length - 10} more locations</li>}
        </ul>
      </div>

      <GoogleMap
        mapContainerStyle={{ width: '100%', height }}
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
                  title={`${location.name} - ${location.address}`}
                />
              ))}
            </>
          )}
        </MarkerClusterer>

        {selectedLocation && (
          <InfoWindow
            position={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
            onCloseClick={() => setSelectedLocation(null)}
            options={{ pixelOffset: new google.maps.Size(0, -32) }}
          >
            <LocationInfoWindow location={selectedLocation} />
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}

function LocationInfoWindow({ location }: { location: McDonaldsLocation }) {
  const isOpen = location.business_status === 'OPERATIONAL'

  return (
    <div className="p-3 max-w-sm">
      <div className="flex items-start gap-3 mb-3">
        {location.photo && (
          <img
            src={location.photo}
            alt=""
            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{location.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{location.address}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {location.rating && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" aria-hidden="true" />
            <span className="font-medium">{location.rating}</span>
            <span className="text-gray-500">({location.reviews_count} reviews)</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} aria-hidden="true" />
          <span className={`text-sm font-medium ${isOpen ? 'text-green-700' : 'text-red-700'}`}>
            {isOpen ? 'Open' : 'Closed'}
          </span>
        </div>

        {location.distance && (
          <div className="flex items-center gap-1 text-gray-500">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            <span>{formatDistance(location.distance)}</span>
          </div>
        )}

        {location.phone && (
          <div className="flex items-center gap-1 text-gray-500">
            <Phone className="h-4 w-4" aria-hidden="true" />
            <a href={`tel:${location.phone}`} className="hover:text-blue-600">
              {location.phone}
            </a>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
        <Link
          to={`/location/${location.slug}`}
          className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded text-center hover:bg-red-700 transition-colors"
        >
          View Details
        </Link>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
        >
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
          Directions
          <span className="sr-only">(opens in Google Maps)</span>
        </a>
      </div>
    </div>
  )
}
