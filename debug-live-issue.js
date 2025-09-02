// Debug the exact live issue: BR3 5UF showing 272m for Strand McDonald's

// Exact coordinates from our geocoding test
const br3Coords = { latitude: 51.4102928, longitude: -0.0213582 };
const strandCoords = { latitude: 51.5087957, longitude: -0.1245731 };

// Haversine formula (exact copy from supabase.ts)
function calculateDistance(lat1, lon1, lat2, lon2) {
  console.log(`Calculating distance between (${lat1}, ${lon1}) and (${lat2}, ${lon2})`);
  
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  console.log(`φ1: ${φ1}, φ2: ${φ2}, Δφ: ${Δφ}, Δλ: ${Δλ}`);

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  console.log(`a: ${a}, c: ${c}`);

  const distance = R * c;
  console.log(`Final distance: ${distance}m`);
  return distance;
}

// Format distance (exact copy from supabase.ts)
function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  } else {
    return `${(meters / 1000).toFixed(1)} km`;
  }
}

console.log('=== LIVE ISSUE DEBUG ===\n');

console.log('BR3 5UF coordinates:', br3Coords);
console.log('Strand McDonald\'s coordinates:', strandCoords);

console.log('\n=== DISTANCE CALCULATION ===');
const distance = calculateDistance(
  br3Coords.latitude, br3Coords.longitude,
  strandCoords.latitude, strandCoords.longitude
);

console.log(`\nRaw distance: ${distance}m`);
console.log(`Formatted distance: ${formatDistance(distance)}`);

console.log('\n=== EXPECTED vs ACTUAL ===');
console.log('Expected: ~13.1km (13,080m)');
console.log(`Actual: ${formatDistance(distance)}`);

if (Math.abs(distance - 13080) < 100) {
  console.log('✅ Distance calculation is CORRECT');
} else {
  console.log('❌ Distance calculation is WRONG');
  console.log(`Difference: ${Math.abs(distance - 13080)}m`);
}

// Test if the issue is parameter order
console.log('\n=== PARAMETER ORDER TEST ===');
const reverseDistance = calculateDistance(
  strandCoords.latitude, strandCoords.longitude,
  br3Coords.latitude, br3Coords.longitude
);
console.log(`Reverse order distance: ${formatDistance(reverseDistance)}`);

// Test if there's a precision issue
console.log('\n=== PRECISION TEST ===');
const roundedBr3 = { latitude: Math.round(br3Coords.latitude * 1000000) / 1000000, longitude: Math.round(br3Coords.longitude * 1000000) / 1000000 };
const roundedStrand = { latitude: Math.round(strandCoords.latitude * 1000000) / 1000000, longitude: Math.round(strandCoords.longitude * 1000000) / 1000000 };

console.log('Rounded BR3:', roundedBr3);
console.log('Rounded Strand:', roundedStrand);

const roundedDistance = calculateDistance(
  roundedBr3.latitude, roundedBr3.longitude,
  roundedStrand.latitude, roundedStrand.longitude
);
console.log(`Rounded coordinates distance: ${formatDistance(roundedDistance)}`);
