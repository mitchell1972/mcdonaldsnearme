import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ES modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Supabase configuration
const supabaseUrl = 'https://zjfilhbczaquokqlcoej.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZmlsaGJjemFxdW9rcWxjb2VqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUzNDYyMiwiZXhwIjoyMDcxMTEwNjIyfQ.ySQGnTSDwU6wF_z6dcwvlOKlOWl-Bm5uP67PTfRZoOQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Generate URL-friendly slug with ID to ensure uniqueness
function generateSlug(name, address, id) {
  const combined = `${name} ${address}`
  const baseSlug = combined
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
    .substring(0, 80) // Leave room for ID suffix
  
  return `${baseSlug}-${id}` // Add ID to ensure uniqueness
}

async function reimportLocations() {
  try {
    console.log('🍟 Starting McDonald\'s locations re-import...')
    
    // Load the JSON data
    const dataPath = path.join(__dirname, '../../data/mcdonalds_locations.json')
    const rawData = fs.readFileSync(dataPath, 'utf8')
    const locations = JSON.parse(rawData)
    
    console.log(`📍 Found ${locations.length} locations in JSON file`)
    
    // Clear existing data
    console.log('🧹 Clearing existing locations...')
    const { error: deleteError } = await supabase
      .from('mcdonalds_locations')
      .delete()
      .neq('id', 0) // Delete all records
    
    if (deleteError) {
      console.error('❌ Error clearing locations:', deleteError)
      return
    }
    
    console.log('✅ Existing locations cleared')
    
    // Process locations in batches
    const BATCH_SIZE = 50
    const batches = []
    
    for (let i = 0; i < locations.length; i += BATCH_SIZE) {
      batches.push(locations.slice(i, i + BATCH_SIZE))
    }
    
    console.log(`📦 Processing ${batches.length} batches of ${BATCH_SIZE} locations each...`)
    
    let totalProcessed = 0
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      
      const processedBatch = batch.map((location, index) => {
        const globalIndex = batchIndex * BATCH_SIZE + index + 1
        const slug = generateSlug(location.name, location.address, globalIndex)
        
        return {
          id: globalIndex,
          name: location.name || 'McDonald\'s',
          address: location.address || '',
          street: location.street || '',
          city: location.city || 'London',
          postal_code: location.postal_code || '',
          country: location.country || 'United Kingdom',
          phone: location.phone || null,
          website: location.website || null,
          latitude: location.latitude || 0,
          longitude: location.longitude || 0,
          rating: location.rating ? parseFloat(location.rating) : null,
          reviews_count: location.reviews_count || 0,
          reviews_link: location.reviews_link || null,
          working_hours: location.working_hours || '',
          photo: location.photo || null,
          photos_count: location.photos_count || 0,
          business_status: location.business_status || 'OPERATIONAL',
          about: location.about || null,
          slug: slug,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      })
      
      const { error: insertError } = await supabase
        .from('mcdonalds_locations')
        .insert(processedBatch)
      
      if (insertError) {
        console.error(`❌ Error inserting batch ${batchIndex + 1}:`, insertError)
        continue
      }
      
      totalProcessed += processedBatch.length
      console.log(`✅ Batch ${batchIndex + 1}/${batches.length} completed (${totalProcessed}/${locations.length} locations)`)
    }
    
    // Verify final count
    const { count, error: countError } = await supabase
      .from('mcdonalds_locations')
      .select('*', { count: 'exact' })
    
    if (countError) {
      console.error('❌ Error counting final locations:', countError)
      return
    }
    
    console.log(`\n🎉 Import completed successfully!`)
    console.log(`📊 Total locations imported: ${totalProcessed}`)
    console.log(`📊 Database count verification: ${count}`)
    console.log(`${count === 285 ? '✅' : '⚠️'} Expected 285 locations, got ${count}`)
    
  } catch (error) {
    console.error('❌ Import failed:', error)
    throw error
  }
}

// Run the import
reimportLocations()
  .then(() => {
    console.log('\n🎯 Re-import process completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Re-import process failed:', error)
    process.exit(1)
  })
