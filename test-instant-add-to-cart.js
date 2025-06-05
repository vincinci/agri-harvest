#!/usr/bin/env node

/**
 * Test: Instant Add to Cart Performance
 * Tests that add to cart operations are truly instant
 */

const puppeteer = require('puppeteer')

async function testInstantAddToCart() {
  console.log('🧪 Testing instant add to cart performance...')
  
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 50 // Very fast to show instant response
  })
  
  try {
    const page = await browser.newPage()
    
    // Navigate to products page
    console.log('📱 Opening products page...')
    await page.goto('http://localhost:3000/products')
    await page.waitForSelector('button:has-text("Add to Cart")', { timeout: 10000 })
    
    // Test 1: Measure add to cart response time
    console.log('⏱️  Testing add to cart speed...')
    
    const startTime = Date.now()
    
    // Click add to cart button
    await page.click('button:has-text("Add to Cart")')
    
    // Wait for button text to change back (indicating completion)
    await page.waitForFunction(
      () => {
        const buttons = Array.from(document.querySelectorAll('button'))
        return buttons.some(btn => btn.textContent.includes('Add to Cart') && !btn.disabled)
      },
      { timeout: 1000 }
    )
    
    const responseTime = Date.now() - startTime
    console.log(`✅ Add to cart completed in ${responseTime}ms`)
    
    if (responseTime < 100) {
      console.log('🎉 EXCELLENT: Add to cart is instant (< 100ms)')
    } else if (responseTime < 300) {
      console.log('✅ GOOD: Add to cart is fast (< 300ms)')
    } else {
      console.log('⚠️  SLOW: Add to cart takes too long (> 300ms)')
    }
    
    // Test 2: Check cart count update
    console.log('📊 Checking cart count update...')
    
    const cartCountBefore = await page.evaluate(() => {
      const cartBtn = document.querySelector('button:has(svg)')
      const badge = cartBtn?.querySelector('span')
      return badge ? parseInt(badge.textContent) : 0
    })
    
    // Add another item
    const startTime2 = Date.now()
    await page.click('button:has-text("Add to Cart")')
    
    // Check if cart count updated immediately
    await page.waitForFunction(
      (expectedCount) => {
        const cartBtn = document.querySelector('button:has(svg)')
        const badge = cartBtn?.querySelector('span')
        const currentCount = badge ? parseInt(badge.textContent) : 0
        return currentCount > expectedCount
      },
      { timeout: 500 },
      cartCountBefore
    )
    
    const countUpdateTime = Date.now() - startTime2
    console.log(`✅ Cart count updated in ${countUpdateTime}ms`)
    
    // Test 3: Multiple rapid clicks
    console.log('🔥 Testing rapid clicking...')
    
    const rapidStartTime = Date.now()
    
    // Click 3 times rapidly
    await page.click('button:has-text("Add to Cart")')
    await page.click('button:has-text("Add to Cart")')
    await page.click('button:has-text("Add to Cart")')
    
    const rapidEndTime = Date.now() - rapidStartTime
    console.log(`✅ Rapid clicking completed in ${rapidEndTime}ms`)
    
    console.log('\n📊 PERFORMANCE SUMMARY:')
    console.log(`- Single add to cart: ${responseTime}ms`)
    console.log(`- Cart count update: ${countUpdateTime}ms`)
    console.log(`- Rapid clicking (3x): ${rapidEndTime}ms`)
    
    if (responseTime < 100 && countUpdateTime < 100 && rapidEndTime < 300) {
      console.log('🎉 SUCCESS: Add to cart is INSTANT!')
    } else {
      console.log('⚠️  NEEDS IMPROVEMENT: Some operations could be faster')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    await browser.close()
  }
}

// Run the test
testInstantAddToCart().catch(console.error) 