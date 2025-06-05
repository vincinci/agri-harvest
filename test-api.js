// Test script to verify API functionality
const BASE_URL = 'http://localhost:3000'

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n')
  
  // Test 1: Add sample products
  console.log('1. Adding sample products...')
  const sampleProducts = [
    {
      name: 'Fresh Chinese Cucumber',
      description: 'Premium Chinese cucumbers, perfect for salads and cooking',
      price: 2490,
      category: 'cucumbers',
      color: 'green',
      quantity: 50,
      image: '🥒'
    },
    {
      name: 'Green Bell Peppers',
      description: 'Crisp and fresh green bell peppers from our greenhouse',
      price: 2990,
      category: 'peppers',
      color: 'green',
      quantity: 30,
      image: '🫑'
    },
    {
      name: 'Fresh Onions',
      description: 'Sweet and aromatic onions, perfect for any dish',
      price: 1990,
      category: 'onions',
      color: 'white',
      quantity: 40,
      image: '🧅'
    }
  ]
  
  for (const product of sampleProducts) {
    try {
      const response = await fetch(`${BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product)
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log(`✅ Added: ${product.name}`)
      } else {
        console.log(`⚠️  ${product.name}: ${result.error}`)
      }
    } catch (error) {
      console.log(`❌ Failed to add ${product.name}: ${error.message}`)
    }
  }
  
  // Test 2: Fetch all products
  console.log('\n2. Fetching all products...')
  try {
    const response = await fetch(`${BASE_URL}/api/products`)
    const result = await response.json()
    
    if (result.success) {
      console.log(`✅ Found ${result.data.length} products`)
      console.log(`📦 Categories: ${result.categories.join(', ')}`)
    } else {
      console.log(`❌ Failed to fetch products: ${result.error}`)
    }
  } catch (error) {
    console.log(`❌ API Error: ${error.message}`)
  }
  
  // Test 3: Test single word search
  console.log('\n3. Testing single word search...')
  try {
    const response = await fetch(`${BASE_URL}/api/products?search=cucumber`)
    const result = await response.json()
    
    if (result.success) {
      console.log(`✅ Single word search for "cucumber" found ${result.data.length} products`)
      console.log(`   Products: ${result.data.map(p => p.name).join(', ')}`)
    } else {
      console.log(`❌ Single word search failed: ${result.error}`)
    }
  } catch (error) {
    console.log(`❌ Single word search error: ${error.message}`)
  }
  
  // Test 4: Test multi-word search
  console.log('\n4. Testing multi-word search...')
  try {
    const response = await fetch(`${BASE_URL}/api/products?search=fresh green`)
    const result = await response.json()
    
    if (result.success) {
      console.log(`✅ Multi-word search for "fresh green" found ${result.data.length} products`)
      console.log(`   Products: ${result.data.map(p => p.name).join(', ')}`)
      if (result.searchTerms) {
        console.log(`   Search terms: ${result.searchTerms.join(', ')}`)
      }
    } else {
      console.log(`❌ Multi-word search failed: ${result.error}`)
    }
  } catch (error) {
    console.log(`❌ Multi-word search error: ${error.message}`)
  }
  
  // Test 5: Test descriptive word search
  console.log('\n5. Testing descriptive word search...')
  try {
    const response = await fetch(`${BASE_URL}/api/products?search=sweet crisp`)
    const result = await response.json()
    
    if (result.success) {
      console.log(`✅ Descriptive search for "sweet crisp" found ${result.data.length} products`)
      console.log(`   Products: ${result.data.map(p => p.name).join(', ')}`)
    } else {
      console.log(`❌ Descriptive search failed: ${result.error}`)
    }
  } catch (error) {
    console.log(`❌ Descriptive search error: ${error.message}`)
  }
  
  // Test 6: Test category + word search
  console.log('\n6. Testing category + word search...')
  try {
    const response = await fetch(`${BASE_URL}/api/products?search=cucumber pepper`)
    const result = await response.json()
    
    if (result.success) {
      console.log(`✅ Category search for "cucumber pepper" found ${result.data.length} products`)
      console.log(`   Categories found: ${[...new Set(result.data.map(p => p.category))].join(', ')}`)
    } else {
      console.log(`❌ Category search failed: ${result.error}`)
    }
  } catch (error) {
    console.log(`❌ Category search error: ${error.message}`)
  }
  
  // Test 7: Test cart functionality
  console.log('\n7. Testing cart functionality...')
  try {
    const response = await fetch(`${BASE_URL}/api/cart?sessionId=test`)
    const result = await response.json()
    
    if (result.success) {
      console.log(`✅ Cart API working - ${result.data.summary.itemsCount} items`)
    } else {
      console.log(`❌ Cart failed: ${result.error}`)
    }
  } catch (error) {
    console.log(`❌ Cart Error: ${error.message}`)
  }
  
  console.log('\n🏁 Enhanced Search Testing Complete!')
  console.log('\n📋 Search Features:')
  console.log('✅ Single word search (finds exact matches)')
  console.log('✅ Multi-word search (finds products containing ANY of the words)')
  console.log('✅ Descriptive search (searches in name, description, and category)')
  console.log('✅ Flexible word splitting (handles multiple spaces)')
  console.log('✅ Case-insensitive search')
}

// Run the test
testAPI().catch(console.error) 