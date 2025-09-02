import { test, expect } from '@playwright/test';

// Helper function to calculate expected distance using Haversine formula
function calculateExpectedDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

// Known McDonald's locations with their exact coordinates
const knownLocations = {
  'WC2N 5HY': { // McDonald's Strand
    latitude: 51.5087957,
    longitude: -0.1245731,
    address: '34/35 Strand, London WC2N 5HY'
  },
  'WC2H 7LU': { // McDonald's Leicester Square
    latitude: 51.5102,
    longitude: -0.1309,
    address: '48 Leicester Square, London WC2H 7LU'
  },
  'W1D 1AW': { // McDonald's Oxford Street
    latitude: 51.5152,
    longitude: -0.1426,
    address: '8, 10 Oxford St, London W1D 1AW'
  }
};

// Test postcodes with their geocoded coordinates
const testPostcodes = {
  'BR3 5UF': { latitude: 51.4102928, longitude: -0.0213582 },
  'SW16 6HG': { latitude: 51.42772859999999, longitude: -0.1314143 },
  'E14 5AB': { latitude: 51.5074, longitude: -0.0198 },
  'NW1 2DB': { latitude: 51.5246, longitude: -0.1340 },
  'SE1 7PB': { latitude: 51.5033, longitude: -0.1195 }
};

test.describe('Distance Calculation Accuracy Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to load
    await page.waitForSelector('input[placeholder*="Search by location"]', { timeout: 10000 });
  });

  test('BR3 5UF - Should show correct distances to McDonald\'s locations', async ({ page }) => {
    const postcode = 'BR3 5UF';
    const coordinates = testPostcodes[postcode];
    
    // Enter postcode and search
    await page.fill('input[placeholder*="Search by location"]', postcode);
    await page.click('button:has-text("Search")');
    
    // Wait for results
    await page.waitForSelector('text=/Found \\d+ locations/', { timeout: 10000 });
    
    // Get the first few results
    const locationCards = page.locator('[class*="border"][class*="rounded"]').filter({ hasText: 'McDonald\'s' });
    const count = await locationCards.count();
    
    console.log(`Found ${count} McDonald's locations for ${postcode}`);
    
    // Check at least the first 3 results
    for (let i = 0; i < Math.min(3, count); i++) {
      const card = locationCards.nth(i);
      
      // Get the displayed distance
      const distanceElement = await card.locator('text=/\\d+(\\.\\d+)?\\s*(km|m)/').textContent();
      console.log(`Location ${i + 1} displayed distance: ${distanceElement}`);
      
      // Parse the distance
      const distanceMatch = distanceElement?.match(/([\d.]+)\s*(km|m)/);
      if (distanceMatch) {
        const value = parseFloat(distanceMatch[1]);
        const unit = distanceMatch[2];
        const distanceInMeters = unit === 'km' ? value * 1000 : value;
        
        // Get the address to identify which McDonald's this is
        const addressText = await card.locator('text=/London [A-Z0-9]+ [A-Z0-9]+/').textContent();
        console.log(`Location ${i + 1} address: ${addressText}`);
        
        // For the Strand McDonald's, we know the exact expected distance
        if (addressText?.includes('WC2N 5HY')) {
          const expectedDistance = calculateExpectedDistance(
            coordinates.latitude,
            coordinates.longitude,
            knownLocations['WC2N 5HY'].latitude,
            knownLocations['WC2N 5HY'].longitude
          );
          
          console.log(`Expected distance to Strand McDonald's: ${expectedDistance}m (${(expectedDistance/1000).toFixed(1)}km)`);
          console.log(`Displayed distance: ${distanceInMeters}m`);
          
          // Allow 5% tolerance for rounding and geocoding variations
          const tolerance = 0.05;
          expect(Math.abs(distanceInMeters - expectedDistance) / expectedDistance).toBeLessThan(tolerance);
        }
      }
    }
  });

  test('SW16 6HG - Should show correct distances', async ({ page }) => {
    const postcode = 'SW16 6HG';
    const coordinates = testPostcodes[postcode];
    
    await page.fill('input[placeholder*="Search by location"]', postcode);
    await page.click('button:has-text("Search")');
    
    await page.waitForSelector('text=/Found \\d+ locations/', { timeout: 10000 });
    
    const locationCards = page.locator('[class*="border"][class*="rounded"]').filter({ hasText: 'McDonald\'s' });
    const count = await locationCards.count();
    
    // Verify we have results
    expect(count).toBeGreaterThan(0);
    
    // Check first result has a reasonable distance (should be less than 20km for London)
    const firstCard = locationCards.first();
    const distanceText = await firstCard.locator('text=/\\d+(\\.\\d+)?\\s*(km|m)/').textContent();
    
    const distanceMatch = distanceText?.match(/([\d.]+)\s*(km|m)/);
    if (distanceMatch) {
      const value = parseFloat(distanceMatch[1]);
      const unit = distanceMatch[2];
      const distanceInKm = unit === 'km' ? value : value / 1000;
      
      // SW16 is in South London, so nearest McDonald's should be within 10km
      expect(distanceInKm).toBeLessThan(10);
      expect(distanceInKm).toBeGreaterThan(0.1); // Should not be unrealistically close
    }
  });

  test('Distance sorting - Results should be ordered by distance', async ({ page }) => {
    const postcode = 'E14 5AB';
    
    await page.fill('input[placeholder*="Search by location"]', postcode);
    await page.click('button:has-text("Search")');
    
    await page.waitForSelector('text=/Found \\d+ locations/', { timeout: 10000 });
    
    const locationCards = page.locator('[class*="border"][class*="rounded"]').filter({ hasText: 'McDonald\'s' });
    const count = await locationCards.count();
    
    const distances: number[] = [];
    
    // Get all distances
    for (let i = 0; i < Math.min(5, count); i++) {
      const card = locationCards.nth(i);
      const distanceText = await card.locator('text=/\\d+(\\.\\d+)?\\s*(km|m)/').textContent();
      
      const distanceMatch = distanceText?.match(/([\d.]+)\s*(km|m)/);
      if (distanceMatch) {
        const value = parseFloat(distanceMatch[1]);
        const unit = distanceMatch[2];
        const distanceInMeters = unit === 'km' ? value * 1000 : value;
        distances.push(distanceInMeters);
      }
    }
    
    // Verify distances are in ascending order
    for (let i = 1; i < distances.length; i++) {
      expect(distances[i]).toBeGreaterThanOrEqual(distances[i - 1]);
    }
  });

  test('Multiple postcodes - Cross-validation test', async ({ page }) => {
    // Test multiple postcodes to ensure consistency
    const testCases = [
      { postcode: 'NW1 2DB', maxDistance: 15 }, // North London
      { postcode: 'SE1 7PB', maxDistance: 10 }, // Central/South London
      { postcode: 'BR3 5UF', maxDistance: 20 }  // Outer London
    ];
    
    for (const testCase of testCases) {
      await page.fill('input[placeholder*="Search by location"]', testCase.postcode);
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('text=/Found \\d+ locations/', { timeout: 10000 });
      
      const locationCards = page.locator('[class*="border"][class*="rounded"]').filter({ hasText: 'McDonald\'s' });
      const count = await locationCards.count();
      
      expect(count).toBeGreaterThan(0);
      
      // Check first result is within expected range
      const firstCard = locationCards.first();
      const distanceText = await firstCard.locator('text=/\\d+(\\.\\d+)?\\s*(km|m)/').textContent();
      
      const distanceMatch = distanceText?.match(/([\d.]+)\s*(km|m)/);
      if (distanceMatch) {
        const value = parseFloat(distanceMatch[1]);
        const unit = distanceMatch[2];
        const distanceInKm = unit === 'km' ? value : value / 1000;
        
        console.log(`${testCase.postcode}: First McDonald's at ${distanceInKm}km`);
        expect(distanceInKm).toBeLessThan(testCase.maxDistance);
      }
      
      // Clear search for next test
      await page.fill('input[placeholder*="Search by location"]', '');
    }
  });

  test('Known problematic case - BR3 5UF to Strand McDonald\'s', async ({ page }) => {
    // This was showing 272m instead of ~13km
    const postcode = 'BR3 5UF';
    const br3Coords = testPostcodes[postcode];
    const strandMcDonalds = knownLocations['WC2N 5HY'];
    
    // Calculate expected distance
    const expectedDistance = calculateExpectedDistance(
      br3Coords.latitude,
      br3Coords.longitude,
      strandMcDonalds.latitude,
      strandMcDonalds.longitude
    );
    
    const expectedDistanceKm = expectedDistance / 1000;
    console.log(`Expected distance from BR3 5UF to Strand McDonald's: ${expectedDistanceKm.toFixed(1)}km`);
    
    await page.fill('input[placeholder*="Search by location"]', postcode);
    await page.click('button:has-text("Search")');
    
    await page.waitForSelector('text=/Found \\d+ locations/', { timeout: 10000 });
    
    // Look for the Strand McDonald's in results
    const strandCard = page.locator('[class*="border"][class*="rounded"]')
      .filter({ hasText: 'McDonald\'s' })
      .filter({ hasText: 'WC2N 5HY' })
      .first();
    
    const cardExists = await strandCard.count() > 0;
    
    if (cardExists) {
      const distanceText = await strandCard.locator('text=/\\d+(\\.\\d+)?\\s*(km|m)/').textContent();
      console.log(`Displayed distance to Strand McDonald's: ${distanceText}`);
      
      const distanceMatch = distanceText?.match(/([\d.]+)\s*(km|m)/);
      if (distanceMatch) {
        const value = parseFloat(distanceMatch[1]);
        const unit = distanceMatch[2];
        const distanceInKm = unit === 'km' ? value : value / 1000;
        
        // Should be around 13km, NOT 272m (0.272km)
        expect(distanceInKm).toBeGreaterThan(10); // Must be more than 10km
        expect(distanceInKm).toBeLessThan(16); // But less than 16km
        
        // More precise check - within 10% of expected
        const difference = Math.abs(distanceInKm - expectedDistanceKm);
        const percentDifference = (difference / expectedDistanceKm) * 100;
        expect(percentDifference).toBeLessThan(10);
      }
    }
  });

  test('Verify no 272m bug - Check for unrealistic close distances', async ({ page }) => {
    // Test that we don't see the 272m bug for any outer London postcodes
    const outerLondonPostcodes = ['BR3 5UF', 'RM10 7HX', 'EN5 1QT'];
    
    for (const postcode of outerLondonPostcodes) {
      await page.fill('input[placeholder*="Search by location"]', postcode);
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('text=/Found \\d+ locations/', { timeout: 10000 });
      
      const locationCards = page.locator('[class*="border"][class*="rounded"]').filter({ hasText: 'McDonald\'s' });
      const firstCard = locationCards.first();
      
      if (await firstCard.count() > 0) {
        const distanceText = await firstCard.locator('text=/\\d+(\\.\\d+)?\\s*(km|m)/').textContent();
        
        const distanceMatch = distanceText?.match(/([\d.]+)\s*(km|m)/);
        if (distanceMatch) {
          const value = parseFloat(distanceMatch[1]);
          const unit = distanceMatch[2];
          const distanceInMeters = unit === 'km' ? value * 1000 : value;
          
          // For outer London postcodes, the nearest McDonald's should NOT be less than 1km
          // This catches the 272m bug
          console.log(`${postcode}: Nearest McDonald's at ${distanceInMeters}m`);
          expect(distanceInMeters).toBeGreaterThan(1000);
        }
      }
      
      // Clear for next test
      await page.fill('input[placeholder*="Search by location"]', '');
    }
  });
});

test.describe('Search Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('input[placeholder*="Search by location"]', { timeout: 10000 });
  });

  test('Should return results for valid postcodes', async ({ page }) => {
    const validPostcodes = ['SW1A 1AA', 'EC1A 1BB', 'W1A 0AX'];
    
    for (const postcode of validPostcodes) {
      await page.fill('input[placeholder*="Search by location"]', postcode);
      await page.click('button:has-text("Search")');
      
      // Should either show results or "No locations found" (not an error)
      await expect(page.locator('text=/Found \\d+ locations|No locations found/')).toBeVisible({ timeout: 10000 });
      
      // Clear for next test
      await page.fill('input[placeholder*="Search by location"]', '');
    }
  });

  test('Should handle partial postcodes', async ({ page }) => {
    const partialPostcodes = ['SW1', 'EC1', 'BR3'];
    
    for (const postcode of partialPostcodes) {
      await page.fill('input[placeholder*="Search by location"]', postcode);
      await page.click('button:has-text("Search")');
      
      await expect(page.locator('text=/Found \\d+ locations|No locations found/')).toBeVisible({ timeout: 10000 });
      
      await page.fill('input[placeholder*="Search by location"]', '');
    }
  });
});
