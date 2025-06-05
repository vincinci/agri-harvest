const fetch = require('node-fetch');

async function testCartFlow() {
  console.log('🛒 Testing Complete Cart Flow...\n');
  
  try {
    // 1. Add item to cart
    console.log('1. Adding item to cart...');
    const addResponse = await fetch('http://localhost:3000/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 1,
        quantity: 2,
        sessionId: 'test-flow'
      })
    });
    const addResult = await addResponse.json();
    console.log('   ✅ Add result:', addResult.success ? 'Success' : 'Failed');
    
    // 2. Get cart contents
    console.log('2. Getting cart contents...');
    const getResponse = await fetch('http://localhost:3000/api/cart?sessionId=test-flow');
    const getResult = await getResponse.json();
    console.log('   ✅ Cart items:', getResult.data?.items?.length || 0);
    console.log('   ✅ Total amount:', getResult.data?.summary?.total || 0, 'RWF');
    
    // 3. Update quantity using the correct itemId
    if (getResult.data?.items?.length > 0) {
      const itemId = getResult.data.items[0].id;
      console.log('3. Updating quantity for item ID:', itemId);
      const updateResponse = await fetch('http://localhost:3000/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: itemId,
          quantity: 3
        })
      });
      const updateResult = await updateResponse.json();
      console.log('   ✅ Update result:', updateResult.success ? 'Success' : 'Failed');
      
      // 4. Verify the update
      console.log('4. Verifying update...');
      const verifyResponse = await fetch('http://localhost:3000/api/cart?sessionId=test-flow');
      const verifyResult = await verifyResponse.json();
      console.log('   ✅ Updated total:', verifyResult.data?.summary?.total || 0, 'RWF');
    } else {
      console.log('3. No items in cart to update');
    }
    
    console.log('\n🎉 Cart flow test completed!');
  } catch (error) {
    console.log('❌ Cart flow error:', error.message);
  }
}

testCartFlow(); 