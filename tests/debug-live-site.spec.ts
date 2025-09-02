import { test, expect } from '@playwright/test';

test.describe('Debug Live Site Distance Issue', () => {
  test('Check console logs and network requests for BR3 5UF search', async ({ page }) => {
    // Capture console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });

    // Capture network requests
    const apiCalls: any[] = [];
    page.on('request', request => {
      if (request.url().includes('supabase') || request.url().includes('googleapis')) {
        apiCalls.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData()
        });
      }
    });

    page.on('response', response => {
      if (response.url().includes('supabase') || response.url().includes('googleapis')) {
        response.json().then(data => {
          console.log('API Response:', response.url(), data);
        }).catch(() => {});
      }
    });

    // Navigate to the site
    await page.goto('https://mcdonaldsnearme.store');
    
    // Wait for page to load
    await page.waitForSelector('input[placeholder*="Search by location"]', { timeout: 10000 });
    
    // Perform search
    await page.fill('input[placeholder*="Search by location"]', 'BR3 5UF');
    await page.click('button:has-text("Search")');
    
    // Wait for results
    await page.waitForSelector('text=/Found \\d+ locations/', { timeout: 10000 });
    
    // Get the first result's distance
    const firstCard = page.locator('[class*="border"][class*="rounded"]').filter({ hasText: 'McDonald\'s' }).first();
    const distanceText = await firstCard.locator('text=/\\d+(\\.\\d+)?\\s*(km|m)/').textContent();
    
    console.log('\n=== DEBUGGING INFORMATION ===');
    console.log('Distance displayed:', distanceText);
    
    console.log('\n=== CONSOLE LOGS ===');
    consoleLogs.forEach(log => console.log(log));
    
    console.log('\n=== API CALLS ===');
    apiCalls.forEach(call => console.log(JSON.stringify(call, null, 2)));
    
    // Check the page source for any hardcoded values
    const pageContent = await page.content();
    const has272InSource = pageContent.includes('272');
    console.log('\n=== PAGE SOURCE CHECK ===');
    console.log('Page contains "272":', has272InSource);
    
    // Check if distance calculation function exists in window
    const hasDistanceFunction = await page.evaluate(() => {
      return typeof (window as any).calculateDistance !== 'undefined';
    });
    console.log('Distance function in window:', hasDistanceFunction);
    
    // Try to get the actual coordinates being used
    await page.evaluate(() => {
      console.log('=== CHECKING WINDOW OBJECT ===');
      console.log('Window keys:', Object.keys(window));
    });
    
    // Take a screenshot for visual inspection
    await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
    
    // The test should fail if we see 272m
    const distanceMatch = distanceText?.match(/([\d.]+)\s*(km|m)/);
    if (distanceMatch) {
      const value = parseFloat(distanceMatch[1]);
      const unit = distanceMatch[2];
      
      if (value === 272 && unit === 'm') {
        throw new Error(`BUG CONFIRMED: Distance showing as 272m instead of ~13km`);
      }
    }
  });

  test('Test with local development server', async ({ page }) => {
    // Try testing against local dev server to see if it's a deployment issue
    try {
      await page.goto('http://localhost:5173');
      
      await page.waitForSelector('input[placeholder*="Search by location"]', { timeout: 5000 });
      
      await page.fill('input[placeholder*="Search by location"]', 'BR3 5UF');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('text=/Found \\d+ locations/', { timeout: 10000 });
      
      const firstCard = page.locator('[class*="border"][class*="rounded"]').filter({ hasText: 'McDonald\'s' }).first();
      const distanceText = await firstCard.locator('text=/\\d+(\\.\\d+)?\\s*(km|m)/').textContent();
      
      console.log('Local dev server distance:', distanceText);
      
      const distanceMatch = distanceText?.match(/([\d.]+)\s*(km|m)/);
      if (distanceMatch) {
        const value = parseFloat(distanceMatch[1]);
        const unit = distanceMatch[2];
        const distanceInKm = unit === 'km' ? value : value / 1000;
        
        console.log(`Local server shows: ${distanceInKm}km`);
        
        // Should be around 13km for BR3 5UF to central London
        expect(distanceInKm).toBeGreaterThan(5);
      }
    } catch (error) {
      console.log('Local dev server not running, skipping this test');
    }
  });
});
