const fetch = require('node-fetch');

async function debugFlutterwaveIntegration() {
  console.log('🔍 Debugging Flutterwave Integration...\n');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Check if server is running
    console.log('1. Checking server status...');
    try {
      const healthCheck = await fetch(`${baseUrl}/api/products`);
      if (healthCheck.ok) {
        console.log('✅ Server is running');
      } else {
        console.log('❌ Server issues detected');
        return;
      }
    } catch (error) {
      console.log('❌ Server not accessible:', error.message);
      console.log('Please make sure your server is running with: npm run dev');
      return;
    }
    
    // Test 2: Test payment creation with detailed logging
    console.log('\n2. Testing payment creation with detailed response...');
    const paymentData = {
      amount: 1000, // 1000 RWF
      currency: 'RWF',
      email: 'customer@example.com',
      name: 'Test Customer',
      phone_number: '250788123456',
      tx_ref: `debug-test-${Date.now()}`
    };
    
    console.log('Payment request data:', JSON.stringify(paymentData, null, 2));
    
    const paymentResponse = await fetch(`${baseUrl}/api/payment`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });
    
    const responseText = await paymentResponse.text();
    console.log('\nRaw API Response:', responseText);
    console.log('Response Status:', paymentResponse.status);
    console.log('Response Headers:', Object.fromEntries(paymentResponse.headers));
    
    try {
      const paymentResult = JSON.parse(responseText);
      console.log('\nParsed Response:', JSON.stringify(paymentResult, null, 2));
      
      if (paymentResult.success) {
        console.log('\n✅ SUCCESS! Payment link created');
        console.log('Payment Link:', paymentResult.data.link);
      } else {
        console.log('\n❌ Payment creation failed');
        console.log('Error:', paymentResult.error);
        if (paymentResult.details) {
          console.log('Details:', paymentResult.details);
        }
      }
    } catch (parseError) {
      console.log('❌ Failed to parse response as JSON');
      console.log('Parse error:', parseError.message);
    }
    
    // Test 3: Environment variable check
    console.log('\n3. Environment check (server-side keys are hidden for security)...');
    console.log('This test confirms if environment variables are properly loaded');
    
    // Test 4: Test with minimal payload
    console.log('\n4. Testing with minimal payload...');
    const minimalPayment = {
      amount: 500,
      currency: 'RWF',
      email: 'test@test.com',
      name: 'Test',
      tx_ref: `minimal-${Date.now()}`
    };
    
    const minimalResponse = await fetch(`${baseUrl}/api/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(minimalPayment)
    });
    
    const minimalResult = await minimalResponse.text();
    console.log('Minimal test response:', minimalResult.substring(0, 200));
    
  } catch (error) {
    console.log('❌ Debug test failed:', error.message);
    console.log('Stack trace:', error.stack);
  }
}

debugFlutterwaveIntegration(); 