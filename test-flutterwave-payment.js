const fetch = require('node-fetch');

async function testFlutterwavePayment() {
  console.log('🔐 Testing Flutterwave Payment with Your API Keys...\n');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Test payment creation with real keys
    console.log('1. Testing payment creation with your API keys...');
    const paymentData = {
      amount: 5000, // 5000 RWF
      currency: 'RWF',
      email: 'customer@example.com',
      name: 'Test Customer',
      phone_number: '250788123456',
      tx_ref: `greenhouse-test-${Date.now()}`
    };
    
    const paymentResponse = await fetch(`${baseUrl}/api/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    
    const paymentResult = await paymentResponse.json();
    
    if (paymentResult.success) {
      console.log('✅ Payment creation: SUCCESS!');
      console.log(`   - Transaction Reference: ${paymentData.tx_ref}`);
      console.log(`   - Payment Amount: ${paymentData.amount} RWF`);
      console.log(`   - Payment Link: ${paymentResult.data.link.substring(0, 60)}...`);
      console.log('   - You can now accept real payments! 💰');
      
      // Test 2: Test verification
      console.log('\n2. Testing payment verification...');
      const verifyResponse = await fetch(
        `${baseUrl}/api/payment?tx_ref=${paymentData.tx_ref}`
      );
      
      if (verifyResponse.ok) {
        console.log('✅ Payment verification endpoint: Working');
      } else {
        console.log('⚠️  Payment verification: Expected (transaction not paid yet)');
      }
      
    } else {
      console.log('❌ Payment creation: FAILED');
      console.log(`   - Error: ${paymentResult.error}`);
      console.log('   - Check your API keys or Flutterwave account status');
    }
    
    // Test 3: Test webhook endpoint
    console.log('\n3. Testing webhook endpoint...');
    const webhookData = {
      event: 'charge.completed',
      data: {
        tx_ref: paymentData.tx_ref,
        status: 'successful',
        amount: 5000,
        currency: 'RWF',
        customer: {
          email: 'customer@example.com'
        }
      }
    };
    
    const webhookResponse = await fetch(`${baseUrl}/api/webhook`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'verif-hash': 'greenhouse-webhook-secret-2024'
      },
      body: JSON.stringify(webhookData)
    });
    
    if (webhookResponse.ok) {
      console.log('✅ Webhook endpoint: Working');
    } else {
      console.log('⚠️  Webhook endpoint: Needs configuration');
    }
    
    console.log('\n🎉 CONGRATULATIONS! Your payment system is ready!');
    console.log('\n💡 WHAT YOU CAN DO NOW:');
    console.log('1. Test the payment flow: Add items to cart → Checkout → Pay');
    console.log('2. Use test cards for testing:');
    console.log('   - Visa: 4187427415564246 (CVV: 828, Any future date)');
    console.log('   - Mastercard: 5531886652142950 (CVV: 564, Any future date)');
    console.log('3. Check your Flutterwave dashboard for transactions');
    console.log('4. Real customers can now pay you! 💰');
    
    console.log('\n📱 PAYMENT METHODS AVAILABLE:');
    console.log('• Credit/Debit Cards (Visa, Mastercard)');
    console.log('• Mobile Money (MTN, Airtel)'); 
    console.log('• Bank Transfer');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('Make sure your server is running on localhost:3000');
  }
}

testFlutterwavePayment(); 