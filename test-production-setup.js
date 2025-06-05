const fetch = require('node-fetch');

async function testProductionSetup() {
  console.log('🧪 Testing Production Flutterwave Setup...\n');
  
  const baseUrl = 'http://localhost:3000'; // Change to your production URL
  
  try {
    // Test 1: Create a test payment
    console.log('1. Testing payment creation...');
    const paymentResponse = await fetch(`${baseUrl}/api/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 1000, // 1000 RWF test amount
        currency: 'RWF',
        email: 'test@example.com',
        name: 'Test Customer',
        phone_number: '250788123456',
        tx_ref: `test-${Date.now()}`
      })
    });
    
    const paymentResult = await paymentResponse.json();
    if (paymentResult.success) {
      console.log('✅ Payment creation: Working');
      console.log(`   - Payment link generated: ${paymentResult.data.link.substring(0, 50)}...`);
    } else {
      console.log('❌ Payment creation: Failed');
      console.log(`   - Error: ${paymentResult.error}`);
    }
    
    // Test 2: Test verification endpoint
    console.log('\n2. Testing verification endpoint...');
    const verifyResponse = await fetch(`${baseUrl}/api/payment?tx_ref=test-ref-12345`);
    const verifyResult = await verifyResponse.json();
    
    if (verifyResponse.ok) {
      console.log('✅ Verification endpoint: Accessible');
    } else {
      console.log('⚠️  Verification endpoint: Expected failure for non-existent transaction');
    }
    
    // Test 3: Test webhook endpoint
    console.log('\n3. Testing webhook endpoint...');
    const webhookResponse = await fetch(`${baseUrl}/api/webhook`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'verif-hash': 'test-signature'
      },
      body: JSON.stringify({
        event: 'charge.completed',
        data: {
          tx_ref: 'test-webhook-ref',
          status: 'successful',
          amount: 1000,
          currency: 'RWF'
        }
      })
    });
    
    if (webhookResponse.ok) {
      console.log('✅ Webhook endpoint: Accessible');
    } else {
      console.log('⚠️  Webhook endpoint: Check configuration');
    }
    
    console.log('\n📋 PRODUCTION CHECKLIST:');
    console.log('□ Flutterwave business account verified');
    console.log('□ Live API keys configured in .env');
    console.log('□ Webhook URL set in Flutterwave dashboard');
    console.log('□ Bank account/Mobile Money configured for payouts');
    console.log('□ Domain and SSL certificate ready');
    console.log('□ Production database configured');
    
    console.log('\n💡 NEXT STEPS:');
    console.log('1. Replace test API keys with live keys');
    console.log('2. Update webhook URL to production domain');
    console.log('3. Test with small real transaction');
    console.log('4. Monitor dashboard for settlements');
    console.log('5. Go live! 🚀');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testProductionSetup(); 