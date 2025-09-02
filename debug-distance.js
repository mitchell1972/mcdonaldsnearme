// Debug script to test distance calculations
// Testing the reported issue: BR3 5UF to WC2N 5HY showing 272m instead of ~10.7 miles

// Haversine formula implementation (same as in supabase.ts)
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

// Test coordinates
console.log('=== DISTANCE CALCULATION DEBUG ===\n')

// Test case 1: BR3 5UF to WC2N 5HY (the reported issue)
// Let's first get the coordinates for these postcodes
console.log('Test Case 1: BR3 5UF to WC2N 5HY')
console.log('Expected: ~10.7 miles (17.2 km)')

// BR3 5UF coordinates (approximate - need to verify with geocoding)
const br3Lat = 51.3667
const br3Lon = -0.0167

// WC2N 5HY coordinates (from our data - this is the Strand McDonald's)
const wc2nLat = 51.5087957
const wc2nLon = -0.1245731

const distance1 = calculateDistance(br3Lat, br3Lon, wc2nLat, wc2nLon)
console.log(`BR3 5UF (${br3Lat}, ${br3Lon}) to WC2N 5HY (${wc2nLat}, ${wc2nLon})`)
console.log(`Calculated distance: ${Math.round(distance1)}m (${(distance1/1000).toFixed(1)}km)`)
console.log(`Expected: ~17,200m (17.2km)`)
console.log('')

// Test case 2: Known distance for verification
console.log('Test Case 2: London to Brighton (known ~50 miles)')
const londonLat = 51.5074
const londonLon = -0.1278
const brightonLat = 50.8225
const brightonLon = -0.1372

const distance2 = calculateDistance(londonLat, londonLon, brightonLat, brightonLon)
console.log(`London (${londonLat}, ${londonLon}) to Brighton (${brightonLat}, ${brightonLon})`)
console.log(`Calculated distance: ${Math.round(distance2)}m (${(distance2/1000).toFixed(1)}km)`)
console.log(`Expected: ~80,000m (80km)`)
console.log('')

// Test case 3: Short distance for verification
console.log('Test Case 3: Central London locations')
const oxfordCircusLat = 51.5152
const oxfordCircusLon = -0.1426
const leicesterSquareLat = 51.5102
const leicesterSquareLon = -0.1309

const distance3 = calculateDistance(oxfordCircusLat, oxfordCircusLon, leicesterSquareLat, leicesterSquareLon)
console.log(`Oxford Circus (${oxfordCircusLat}, ${oxfordCircusLon}) to Leicester Square (${leicesterSquareLat}, ${leicesterSquareLon})`)
console.log(`Calculated distance: ${Math.round(distance3)}m (${(distance3/1000).toFixed(1)}km)`)
console.log(`Expected: ~1,000m (1km)`)
console.log('')

// Test case 4: Check if coordinates are being swapped
console.log('Test Case 4: Coordinate swap test')
const distance4 = calculateDistance(wc2nLat, wc2nLon, br3Lat, br3Lon)
console.log(`WC2N 5HY to BR3 5UF (reversed): ${Math.round(distance4)}m (${(distance4/1000).toFixed(1)}km)`)
console.log('')

// Test case 5: Check specific McDonald's locations from our data
console.log('Test Case 5: McDonald\'s locations from database')
// Using first few locations from the JSON data
const locations = [
  { name: "McDonald's N22 6BB", lat: 51.5929705, lon: -0.1067936 },
  { name: "McDonald's N1 9ER", lat: 51.5334099, lon: -0.1084948 },
  { name: "McDonald's SW18 1JT", lat: 51.4622269, lon: -0.1870182 }
]

for (let i = 0; i < locations.length - 1; i++) {
  const loc1 = locations[i]
  const loc2 = locations[i + 1]
  const dist = calculateDistance(loc1.lat, loc1.lon, loc2.lat, loc2.lon)
  console.log(`${loc1.name} to ${loc2.name}: ${Math.round(dist)}m (${(dist/1000).toFixed(1)}km)`)
}

console.log('\n=== ANALYSIS ===')
console.log('If the Haversine formula is working correctly, we should see:')
console.log('- London to Brighton: ~80km')
console.log('- Oxford Circus to Leicester Square: ~1km')
console.log('- McDonald\'s locations: reasonable distances')
console.log('')
console.log('If BR3 5UF to WC2N 5HY shows 272m, the issue is likely:')
console.log('1. Incorrect coordinates for BR3 5UF')
console.log('2. Geocoding returning wrong coordinates')
console.log('3. Coordinate precision/rounding issues')
