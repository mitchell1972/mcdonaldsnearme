import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zjfilhbczaquokqlcoej.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZmlsaGJjemFxdW9rcWxjb2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzQ2MjIsImV4cCI6MjA3MTExMDYyMn0.b6YATor8UyDwYSiSagOQUxM_4sqfCv-89CBXVgC2hP0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// McDonald's location interface
export interface McDonaldsLocation {
  id: number
  name: string
  address: string
  street?: string
  city: string
  postal_code: string
  country: string
  phone?: string
  website?: string
  latitude: number
  longitude: number
  rating?: number
  reviews_count: number
  reviews_link?: string
  working_hours: string
  photo?: string
  photos_count: number
  business_status: string
  about?: any
  slug: string
  created_at: string
  updated_at: string
  distance?: number
}

// Search parameters interface
export interface SearchParams {
  searchQuery?: string
  latitude?: number
  longitude?: number
  radius?: number
  minRating?: number
  openNow?: boolean
  sortBy?: 'distance' | 'rating' | 'name'
  limit?: number
  offset?: number
}

// Geocode an address/postcode to coordinates using Google Maps API
export async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const apiKey = 'AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk'
    const encodedAddress = encodeURIComponent(address + ', UK')
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`,
      {}
    )
    
    if (!response.ok) {
      throw new Error('Geocoding request failed')
    }
    
    const data = await response.json()
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location
      return {
        latitude: location.lat,
        longitude: location.lng
      }
    }
    
    console.log('Geocoding failed:', data.status, data.error_message)
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

// Check if search query looks like a UK postcode
function isUKPostcode(query: string): boolean {
  const postcodeRegex = /^[A-Za-z]{1,2}[0-9]{1,2}[A-Za-z]?\s?[0-9][A-Za-z]{2}$|^[A-Za-z]{1,2}[0-9]{1,2}$/
  return postcodeRegex.test(query.trim())
}

// Check if search query is a partial UK postcode (e.g., BR3, SW1)
function isPartialUKPostcode(query: string): boolean {
  const partialPostcodeRegex = /^[A-Za-z]{1,2}[0-9]{1,2}$/
  return partialPostcodeRegex.test(query.trim())
}

// Search McDonald's locations with improved fallback logic
export async function searchLocations(params: SearchParams): Promise<{
  locations: McDonaldsLocation[]
  total: number
  query: SearchParams
}> {
  const {
    searchQuery,
    latitude: providedLatitude,
    longitude: providedLongitude,
    radius = 20000,
    minRating,
    openNow,
    sortBy = 'distance',
    limit = 50,
    offset = 0
  } = params

  console.log('🔍 SEARCH DEBUG: Starting search with params:', {
    searchQuery,
    hasCoordinates: !!providedLatitude && !!providedLongitude,
    radius,
    sortBy,
    limit
  })

  let searchLatitude = providedLatitude
  let searchLongitude = providedLongitude
  let useGeocoding = false
  let textSearchApplied = false

  // Start with all locations
  let query = supabase
    .from('mcdonalds_locations')
    .select('*', { count: 'exact' })

  // Apply rating filter
  if (minRating) {
    query = query.gte('rating', minRating)
  }

  // IMPROVED SEARCH LOGIC: Handle partial postcodes better
  if (searchQuery && !providedLatitude && !providedLongitude) {
    const trimmedQuery = searchQuery.trim()
    console.log('🔍 SEARCH DEBUG: Processing query:', trimmedQuery)
    
    const isPartialPostcode = isPartialUKPostcode(trimmedQuery)
    const isFullPostcode = isUKPostcode(trimmedQuery) && !isPartialPostcode
    
    console.log('🔍 SEARCH DEBUG: Query analysis:', {
      isPartialPostcode,
      isFullPostcode,
      queryLength: trimmedQuery.length
    })
    
    // For partial postcodes (like BR3), try text search first, then geocoding fallback
    if (isPartialPostcode) {
      console.log('🔍 SEARCH DEBUG: Partial postcode detected, using hybrid approach')
      
      // First try text search for postcode matching
      const searchTerms = [
        `postal_code.ilike.${trimmedQuery}%`,  // BR3* postcodes
        `address.ilike.%${trimmedQuery}%`,     // Address containing BR3
        `city.ilike.%${trimmedQuery}%`         // City containing BR3
      ]
      
      // Test query first to see if we get results
      const testQuery = supabase
        .from('mcdonalds_locations')
        .select('id', { count: 'exact' })
        .or(searchTerms.join(','))
      
      if (minRating) {
        testQuery.gte('rating', minRating)
      }
      
      const { count: textResultCount } = await testQuery
      
      if (textResultCount && textResultCount > 0) {
        // Use text search if we have results
        query = query.or(searchTerms.join(','))
        textSearchApplied = true
        console.log('🔍 SEARCH DEBUG: Applied text search for partial postcode, found', textResultCount, 'results')
      } else {
        // No text results, use geocoding with nearby search
        console.log('🔍 SEARCH DEBUG: No text results for partial postcode, trying geocoding')
        try {
          const geocoded = await geocodeAddress(trimmedQuery)
          if (geocoded) {
            searchLatitude = geocoded.latitude
            searchLongitude = geocoded.longitude
            useGeocoding = true  // Enable radius filtering for proper nearby search
            console.log('🔍 SEARCH DEBUG: Geocoding successful for partial postcode:', geocoded)
          }
        } catch (error) {
          console.log('🔍 SEARCH DEBUG: Geocoding error for partial postcode:', error)
        }
      }
    }
    // For full postcodes, try geocoding first
    else if (isFullPostcode) {
      console.log('🔍 SEARCH DEBUG: Full postcode detected, attempting geocoding')
      try {
        const geocoded = await geocodeAddress(trimmedQuery)
        if (geocoded) {
          searchLatitude = geocoded.latitude
          searchLongitude = geocoded.longitude
          useGeocoding = true
          console.log('🔍 SEARCH DEBUG: Geocoding successful for full postcode:', geocoded)
        }
      } catch (error) {
        console.log('🔍 SEARCH DEBUG: Geocoding error for full postcode:', error)
      }
      
      // Fallback to text search if geocoding failed
      if (!useGeocoding) {
        console.log('🔍 SEARCH DEBUG: Falling back to text search for full postcode')
        const searchTerms = [
          `postal_code.ilike.%${trimmedQuery}%`,
          `address.ilike.%${trimmedQuery}%`,
          `city.ilike.%${trimmedQuery}%`
        ]
        
        query = query.or(searchTerms.join(','))
        textSearchApplied = true
      }
    }
    // For general location searches, try geocoding then text search
    else if (trimmedQuery.length >= 3) {
      console.log('🔍 SEARCH DEBUG: General location search, attempting geocoding')
      try {
        const geocoded = await geocodeAddress(trimmedQuery)
        if (geocoded) {
          searchLatitude = geocoded.latitude
          searchLongitude = geocoded.longitude
          useGeocoding = true
          console.log('🔍 SEARCH DEBUG: Geocoding successful:', geocoded)
        }
      } catch (error) {
        console.log('🔍 SEARCH DEBUG: Geocoding error:', error)
      }
      
      // Fallback to text search if geocoding failed
      if (!useGeocoding) {
        console.log('🔍 SEARCH DEBUG: Falling back to text-based search')
        const searchTerms = [
          `name.ilike.%${trimmedQuery}%`,
          `address.ilike.%${trimmedQuery}%`,
          `city.ilike.%${trimmedQuery}%`,
          `postal_code.ilike.%${trimmedQuery}%`
        ]
        
        query = query.or(searchTerms.join(','))
        textSearchApplied = true
      }
    }
    // For short queries, only use text search
    else if (trimmedQuery.length >= 2) {
      console.log('🔍 SEARCH DEBUG: Short query, using text search only')
      const searchTerms = [
        `name.ilike.%${trimmedQuery}%`,
        `address.ilike.%${trimmedQuery}%`,
        `city.ilike.%${trimmedQuery}%`,
        `postal_code.ilike.%${trimmedQuery}%`
      ]
      
      query = query.or(searchTerms.join(','))
      textSearchApplied = true
    }
  }

  // Apply range
  query = query.range(offset, offset + limit - 1)

  console.log('🔍 SEARCH DEBUG: Executing database query')
  const { data, error, count } = await query

  if (error) {
    console.error('🔍 SEARCH DEBUG: Database error:', error)
    throw new Error(error.message || 'Failed to search locations')
  }

  let locations = data || []
  console.log('🔍 SEARCH DEBUG: Raw database results:', locations.length)

  // Post-process results if we have coordinates
  if (searchLatitude && searchLongitude && locations.length > 0) {
    console.log('🔍 SEARCH DEBUG: Adding distance calculations')
    
    // Add distance calculations
    locations = locations.map(location => ({
      ...location,
      distance: calculateDistance(searchLatitude, searchLongitude, location.latitude, location.longitude)
    }))

    // Filter by radius only if we're doing geographic search
    if (useGeocoding || providedLatitude) {
      const beforeRadius = locations.length
      locations = locations.filter(location => location.distance && location.distance <= radius)
      console.log('🔍 SEARCH DEBUG: After radius filter:', locations.length, 'from', beforeRadius)
    }

    // Sort by distance if requested
    if (sortBy === 'distance') {
      locations.sort((a, b) => (a.distance || 0) - (b.distance || 0))
      console.log('🔍 SEARCH DEBUG: Sorted by distance')
    }
  }

  // Apply non-distance sorting
  if (sortBy !== 'distance') {
    locations.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      } else if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0)
      }
      return 0
    })
    console.log('🔍 SEARCH DEBUG: Sorted by', sortBy)
  }

  // Filter by opening hours if requested
  if (openNow) {
    const beforeHours = locations.length
    locations = locations.filter(location => isLocationOpenNow(location.working_hours))
    console.log('🔍 SEARCH DEBUG: After hours filter:', locations.length, 'from', beforeHours)
  }

  console.log('🔍 SEARCH DEBUG: Final results:', {
    resultCount: locations.length,
    textSearchApplied,
    useGeocoding,
    hasCoordinates: !!searchLatitude && !!searchLongitude
  })

  return {
    locations,
    total: count || locations.length,
    query: params
  }
}

// Get single location by slug
export async function getLocationBySlug(slug: string): Promise<McDonaldsLocation | null> {
  const { data, error } = await supabase
    .from('mcdonalds_locations')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    throw new Error(error.message || 'Failed to fetch location')
  }

  return data
}

// Parse working hours into readable format
export function parseWorkingHours(workingHours: string): { [key: string]: string } {
  const hours: { [key: string]: string } = {}
  
  if (!workingHours) {
    return hours
  }

  const dayHours = workingHours.split('|')
  
  dayHours.forEach(dayHour => {
    const parts = dayHour.split(',')
    if (parts.length >= 3) {
      const day = parts[0]
      const open = parts[1]
      const close = parts[2]
      
      if (open === 'Open 24 hours') {
        hours[day] = 'Open 24 hours'
      } else {
        hours[day] = `${open} - ${close}`
      }
    }
  })
  
  return hours
}

// Check if location is open now
export function isLocationOpenNow(workingHours: string): boolean {
  if (!workingHours) return false
  
  const now = new Date()
  const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()]
  const currentTime = now.getHours() * 60 + now.getMinutes()
  
  const dayHours = workingHours.split('|')
  
  for (const dayHour of dayHours) {
    const parts = dayHour.split(',')
    if (parts.length >= 3 && parts[0] === currentDay) {
      if (parts[1] === 'Open 24 hours') {
        return true
      }
      
      const openTime = parseTime(parts[1])
      const closeTime = parseTime(parts[2])
      
      if (openTime !== null && closeTime !== null) {
        // Handle times that cross midnight
        if (closeTime < openTime) {
          return currentTime >= openTime || currentTime <= closeTime
        } else {
          return currentTime >= openTime && currentTime <= closeTime
        }
      }
    }
  }
  
  return false
}

// Parse time string like "7am" to minutes since midnight
function parseTime(timeStr: string): number | null {
  if (!timeStr) return null
  
  const match = timeStr.match(/(\d{1,2})(am|pm)/i)
  if (!match) return null
  
  let hours = parseInt(match[1])
  const ampm = match[2].toLowerCase()
  
  if (ampm === 'pm' && hours !== 12) {
    hours += 12
  } else if (ampm === 'am' && hours === 12) {
    hours = 0
  }
  
  return hours * 60
}

// Format distance for display
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  } else {
    return `${(meters / 1000).toFixed(1)} km`
  }
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c // Distance in meters
}

// Generate Google Maps directions URL
export function getDirectionsUrl(location: McDonaldsLocation): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`
}

// Get current user location
export function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        reject(new Error('Unable to retrieve your location'))
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 300000
      }
    )
  })
}
