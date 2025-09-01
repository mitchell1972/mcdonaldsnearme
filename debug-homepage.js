// Debug the searchLocations function exactly as HomePage calls it
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zjfilhbczaquokqlcoej.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZmlsaGJjemFxdW9rcWxjb2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzQ2MjIsImV4cCI6MjA3MTExMDYyMn0.b6YATor8UyDwYSiSagOQUxM_4sqfCv-89CBXVgC2hP0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Replicate the exact searchLocations function
async function searchLocations(params) {
  const {
    searchQuery,
    latitude,
    longitude,
    radius = 50000,
    minRating,
    openNow,
    sortBy = 'rating',
    limit = 285,
    offset = 0
  } = params

  console.log('🔍 SearchLocations called with params:', params)
  console.log('📋 Processed parameters:')
  console.log('  - searchQuery:', searchQuery)
  console.log('  - latitude:', latitude)
  console.log('  - longitude:', longitude) 
  console.log('  - radius:', radius)
  console.log('  - limit:', limit)
  console.log('  - sortBy:', sortBy)

  let query = supabase
    .from('mcdonalds_locations')
    .select('*', { count: 'exact' })
    .order(sortBy === 'name' ? 'name' : sortBy === 'rating' ? 'rating' : 'rating', { ascending: sortBy === 'name' })

  // Apply rating filter
  if (minRating) {
    console.log('  ⚠️ Applying rating filter:', minRating)
    query = query.gte('rating', minRating)
  }

  // Apply search filter
  if (searchQuery) {
    console.log('  ⚠️ Applying search filter:', searchQuery)
    query = query.or(`name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,postal_code.ilike.%${searchQuery}%`)
  }

  // Apply range AFTER all filters
  console.log('  📏 Applying range:', offset, 'to', offset + limit - 1)
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('❌ Query error:', error)
    throw new Error(error.message || 'Failed to search locations')
  }

  let locations = data || []
  console.log('📊 Raw query results:')
  console.log('  - Total count from DB:', count)
  console.log('  - Returned items:', locations.length)

  // Calculate distances if coordinates provided
  if (latitude && longitude) {
    console.log('  🗺️ Calculating distances...')
    locations = locations.map(location => ({
      ...location,
      distance: calculateDistance(latitude, longitude, location.latitude, location.longitude)
    }))

    // Filter by radius
    if (radius) {
      console.log('  ⚠️ Applying radius filter:', radius, 'meters')
      const beforeRadius = locations.length
      locations = locations.filter(location => location.distance && location.distance <= radius)
      console.log(`  📍 Radius filter: ${beforeRadius} -> ${locations.length} locations`)
    }
  } else {
    console.log('  ✅ No geographic filtering (no lat/lng provided)')
  }

  console.log('🎯 Final results:')
  console.log('  - Locations returned:', locations.length)
  console.log('  - Total in response:', count)
  
  return {
    locations,
    total: count || locations.length,
    query: params
  }
}

// Haversine formula for distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
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

// Test exactly like HomePage calls it
async function testHomePage() {
  console.log('🏠 Testing HomePage.loadInitialData() call...')
  try {
    const result = await searchLocations({
      limit: 285,
      sortBy: 'rating'
    })
    
    console.log('🎉 HomePage test completed!')
    console.log('Final result:', {
      locationsCount: result.locations.length,
      total: result.total,
      first3: result.locations.slice(0, 3).map(l => ({ name: l.name, rating: l.rating }))
    })
  } catch (error) {
    console.error('💥 HomePage test failed:', error)
  }
}

// Run the test
testHomePage()