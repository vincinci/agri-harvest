const fetch = require('node-fetch');

async function testAPIs() {
  console.log('🧪 Testing API Endpoints...\n');
  
  const tests = [
    { name: 'Products API', url: 'http://localhost:3000/api/products' },
    { name: 'Cart API', url: 'http://localhost:3000/api/cart?sessionId=test' },
    { name: 'Search API', url: 'http://localhost:3000/api/products?search=tomato' },
    { name: 'Category Filter', url: 'http://localhost:3000/api/products?category=vegetables' }
  ];

  for (const test of tests) {
    try {
      const response = await fetch(test.url, { timeout: 5000 });
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ ${test.name}: Working`);
        if (data.data && Array.isArray(data.data)) {
          console.log(`   - Returned ${data.data.length} items`);
        }
        if (data.count !== undefined) {
          console.log(`   - Total count: ${data.count}`);
        }
      } else {
        console.log(`⚠️  ${test.name}: API returned error:`, data.error);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Failed -`, error.message);
    }
  }
  
  console.log('\n🛒 Testing Cart Operations...');
  
  // Test adding to cart
  try {
    const addToCartResponse = await fetch('http://localhost:3000/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 1,
        quantity: 2,
        sessionId: 'test-session'
      }),
      timeout: 5000
    });
    
    const addResult = await addToCartResponse.json();
    if (addResult.success) {
      console.log('✅ Add to Cart: Working');
      console.log(`   - Cart count: ${addResult.cartCount}`);
    } else {
      console.log('⚠️  Add to Cart: Error:', addResult.error);
    }
  } catch (error) {
    console.log('❌ Add to Cart: Failed -', error.message);
  }
  
  console.log('\n✨ API tests completed!');
}

testAPIs(); 