const fetch = require('node-fetch');

async function testCartStability() {
  console.log('🔍 Testing Cart Stability...\n');
  
  const baseUrl = 'http://localhost:3000';
  const sessionId = 'test-stability';
  
  try {
    // 1. Clear cart first
    console.log('1. Clearing cart...');
    await fetch(`${baseUrl}/api/cart?sessionId=${sessionId}`, {
      method: 'DELETE'
    });
    
    // 2. Check cart is empty
    console.log('2. Checking empty cart...');
    let response = await fetch(`${baseUrl}/api/cart?sessionId=${sessionId}`);
    let result = await response.json();
    console.log(`   Items count: ${result.data.summary.itemsCount}`);
    
    // 3. Add one item
    console.log('3. Adding one item...');
    await fetch(`${baseUrl}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId,
        productId: 1,
        quantity: 2
      })
    });
    
    // 4. Check cart multiple times to ensure no unwanted additions
    console.log('4. Checking cart stability (5 checks)...');
    for (let i = 1; i <= 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
      
      response = await fetch(`${baseUrl}/api/cart?sessionId=${sessionId}`);
      result = await response.json();
      
      console.log(`   Check ${i}: ${result.data.summary.itemsCount} items, ${result.data.summary.subtotal} RWF`);
      
      if (result.data.summary.itemsCount !== 2) {
        console.log(`❌ ISSUE: Expected 2 items, got ${result.data.summary.itemsCount}`);
        return;
      }
    }
    
    // 5. Update quantity
    console.log('5. Testing quantity update...');
    const itemId = result.data.items[0].id;
    await fetch(`${baseUrl}/api/cart`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: itemId,
        quantity: 5
      })
    });
    
    // 6. Verify update
    response = await fetch(`${baseUrl}/api/cart?sessionId=${sessionId}`);
    result = await response.json();
    console.log(`   After update: ${result.data.summary.itemsCount} items`);
    
    if (result.data.summary.itemsCount === 5) {
      console.log('✅ Cart is stable and working correctly!');
    } else {
      console.log(`❌ Issue with quantity update: expected 5, got ${result.data.summary.itemsCount}`);
    }
    
    // 7. Clean up
    console.log('6. Cleaning up...');
    await fetch(`${baseUrl}/api/cart?sessionId=${sessionId}`, {
      method: 'DELETE'
    });
    
    console.log('\n🎉 Cart stability test completed!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testCartStability(); 