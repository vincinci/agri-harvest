const fetch = require('node-fetch');

async function quickTest() {
  try {
    console.log('🧪 Quick API Test...');
    const response = await fetch('http://localhost:3000/api/products');
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Products API: Working');
      console.log(`📦 Total products: ${data.count}`);
      console.log(`🌱 First product: ${data.data[0].name} - ${data.data[0].price} RWF`);
    } else {
      console.log('❌ API Error:', data.error);
    }
  } catch (error) {
    console.log('❌ Connection Error:', error.message);
  }
}

quickTest(); 