const fetch = require('node-fetch');

async function testAddToCartSafeguards() {
  console.log('🔒 Testing Add-to-Cart Safeguards...\n');
  
  const baseUrl = 'http://localhost:3000';
  const sessionId = 'test-safeguards';
  
  try {
    // 1. Clear cart first
    console.log('1. Clearing cart...');
    await fetch(`${baseUrl}/api/cart?sessionId=${sessionId}`, {
      method: 'DELETE'
    });
    
    // 2. Verify cart is empty
    let response = await fetch(`${baseUrl}/api/cart?sessionId=${sessionId}`);
    let result = await response.json();
    console.log(`   Cart: ${result.data.summary.itemsCount} items`);
    
    // 3. Test rapid requests (should be prevented by safeguards)
    console.log('\n2. Testing rapid duplicate requests...');
    const promises = [];
    
    // Send 3 rapid requests for the same product
    for (let i = 0; i < 3; i++) {
      promises.push(
        fetch(`${baseUrl}/api/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionId,
            productId: 1,
            quantity: 1
          })
        })
      );
    }
    
    // Wait for all requests to complete
    const responses = await Promise.all(promises);
    const results = await Promise.all(responses.map(r => r.json()));
    
    console.log('   Request results:');
    results.forEach((result, index) => {
      console.log(`   Request ${index + 1}: ${result.success ? 'Success' : 'Failed'} - ${result.message || result.error}`);
    });
    
    // 4. Check final cart state
    console.log('\n3. Checking final cart state...');
    response = await fetch(`${baseUrl}/api/cart?sessionId=${sessionId}`);
    result = await response.json();
    
    console.log(`   Final cart: ${result.data.summary.itemsCount} items`);
    
    if (result.data.items.length > 0) {
      result.data.items.forEach(item => {
        console.log(`   - ${item.name}: Quantity ${item.quantity}`);
      });
    }
    
    // 5. Verify only 1 item was added despite 3 requests
    if (result.data.summary.itemsCount === 1) {
      console.log('\n✅ SUCCESS: Safeguards working! Only 1 item added despite 3 rapid requests.');
    } else if (result.data.summary.itemsCount === 0) {
      console.log('\n⚠️  No items were added. Server might be too slow or have other issues.');
    } else {
      console.log(`\n❌ ISSUE: Expected 1 item, but got ${result.data.summary.itemsCount} items.`);
    }
    
    // 6. Clean up
    console.log('\n4. Cleaning up...');
    await fetch(`${baseUrl}/api/cart?sessionId=${sessionId}`, {
      method: 'DELETE'
    });
    
    console.log('\n🎉 Safeguards test completed!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testAddToCartSafeguards(); 