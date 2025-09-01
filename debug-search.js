// Test script to debug the searchLocations function
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zjfilhbczaquokqlcoej.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZmlsaGJjemFxdW9rcWxjb2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzQ2MjIsImV4cCI6MjA3MTExMDYyMn0.b6YATor8UyDwYSiSagOQUxM_4sqfCv-89CBXVgC2hP0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test the exact query that should be running
async function testQuery() {
  console.log('🔍 Testing Supabase query directly...')
  
  try {
    const { data, error, count } = await supabase
      .from('mcdonalds_locations')
      .select('*', { count: 'exact' })
      .order('rating', { ascending: false })
      .range(0, 284) // 0 to 284 = 285 items
    
    if (error) {
      console.error('❌ Query error:', error)
      return
    }
    
    console.log('✅ Query successful!')
    console.log(`📊 Total count: ${count}`)
    console.log(`📊 Returned items: ${data?.length}`)
    console.log('📍 First 3 locations:')
    data?.slice(0, 3).forEach((loc, i) => {
      console.log(`  ${i + 1}. ${loc.name} - ${loc.address} (Rating: ${loc.rating})`)
    })
    
  } catch (err) {
    console.error('❌ Test failed:', err)
  }
}

// Test without any limits
async function testQueryNoLimit() {
  console.log('\n🔍 Testing query without range limit...')
  
  try {
    const { data, error, count } = await supabase
      .from('mcdonalds_locations')
      .select('*', { count: 'exact' })
      .order('rating', { ascending: false })
    
    if (error) {
      console.error('❌ Query error:', error)
      return
    }
    
    console.log('✅ Query successful!')
    console.log(`📊 Total count: ${count}`)
    console.log(`📊 Returned items: ${data?.length}`)
    
  } catch (err) {
    console.error('❌ Test failed:', err)
  }
}

// Run tests
testQuery().then(() => testQueryNoLimit())