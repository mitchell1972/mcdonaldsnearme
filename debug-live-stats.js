// Debug script to test the exact same call as HomePage
import { searchLocations } from './src/lib/supabase.js'

async function debugStats() {
  try {
    console.log('🔍 Testing exact same call as HomePage loadInitialData...')
    
    const result = await searchLocations({
      limit: 285,
      sortBy: 'rating'
    })
    
    console.log('📊 Results:')
    console.log('- Locations returned:', result.locations.length)
    console.log('- Total count from query:', result.total)
    console.log('- First few locations:', result.locations.slice(0, 3).map(l => l.name))
    
    // Calculate stats exactly like HomePage does
    const totalLocations = result.locations.length
    const ratingsSum = result.locations.reduce((sum, loc) => sum + (loc.rating || 0), 0)
    const locationsWithRating = result.locations.filter(loc => loc.rating).length
    const averageRating = locationsWithRating > 0 ? ratingsSum / locationsWithRating : 0
    const totalReviews = result.locations.reduce((sum, loc) => sum + loc.reviews_count, 0)
    
    const stats = {
      totalLocations,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews
    }
    
    console.log('📋 Calculated stats:', stats)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

debugStats()