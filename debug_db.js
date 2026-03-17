const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
  
  if (error) {
    console.error('Error fetching products:', error)
    return
  }

  console.log(`Found ${data.length} featured products.`)
  data.forEach((p, i) => {
    console.log(`${i+1}. Name: ${p.name_ar}, Images: ${JSON.stringify(p.images)}, Active: ${p.is_active}`)
  })
}

checkProducts()
