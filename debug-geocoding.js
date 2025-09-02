// Debug geocoding and search process
const GOOGLE_API_KEY = 'AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk';

// Geocode function from supabase.ts
async function geocodeAddress(address) {
  try {
    const encodedAddress = encodeURIComponent(address + ', UK');
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng
      };
    }
    
    console.log('Geocoding failed:', data.status, data.error_message);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Distance calculation function
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

// Test the geocoding process
async function testGeocodingProcess() {
  console.log('=== GEOCODING DEBUG ===\n');
  
  // Test BR3 5UF geocoding
  console.log('Testing BR3 5UF geocoding...');
  const br3Coords = await geocodeAddress('BR3 5UF');
  console.log('BR3 5UF geocoded to:', br3Coords);
  
  // Test WC2N 5HY geocoding
  console.log('\nTesting WC2N 5HY geocoding...');
  const wc2nCoords = await geocodeAddress('WC2N 5HY');
  console.log('WC2N 5HY geocoded to:', wc2nCoords);
  
  // Known McDonald's location coordinates (from database)
  const mcdonaldsStrand = {
    latitude: 51.5087957,
    longitude: -0.1245731,
    address: "34/35 Strand, London WC2N 5HY"
  };
  
  console.log('\nKnown McDonald\'s Strand coordinates:', mcdonaldsStrand);
  
  if (br3Coords && wc2nCoords) {
    console.log('\n=== DISTANCE CALCULATIONS ===');
    
    // Distance from BR3 5UF to geocoded WC2N 5HY
    const distanceToGeocoded = calculateDistance(
      br3Coords.latitude, br3Coords.longitude,
      wc2nCoords.latitude, wc2nCoords.longitude
    );
    console.log(`BR3 5UF to geocoded WC2N 5HY: ${distanceToGeocoded}m (${(distanceToGeocoded/1000).toFixed(1)}km)`);
    
    // Distance from BR3 5UF to actual McDonald's coordinates
    const distanceToMcdonalds = calculateDistance(
      br3Coords.latitude, br3Coords.longitude,
      mcdonaldsStrand.latitude, mcdonaldsStrand.longitude
    );
    console.log(`BR3 5UF to McDonald's Strand: ${distanceToMcdonalds}m (${(distanceToMcdonalds/1000).toFixed(1)}km)`);
    
    // Compare geocoded WC2N 5HY vs actual McDonald's coordinates
    const coordDifference = calculateDistance(
      wc2nCoords.latitude, wc2nCoords.longitude,
      mcdonaldsStrand.latitude, mcdonaldsStrand.longitude
    );
    console.log(`Geocoded WC2N 5HY vs McDonald's Strand: ${coordDifference}m (${(coordDifference/1000).toFixed(3)}km)`);
    
    console.log('\n=== ANALYSIS ===');
    if (coordDifference > 100) {
      console.log('❌ ISSUE FOUND: Geocoded coordinates differ significantly from database coordinates');
      console.log('This could explain the 272m vs 17.5km discrepancy');
    } else {
      console.log('✅ Geocoded coordinates match database coordinates closely');
    }
    
    if (Math.abs(distanceToMcdonalds - 17480) < 1000) {
      console.log('✅ Distance calculation is working correctly');
    } else {
      console.log('❌ Distance calculation may have issues');
    }
  }
}

testGeocodingProcess().catch(console.error);
