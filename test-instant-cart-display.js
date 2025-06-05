#!/usr/bin/env node

/**
 * Test: Instant Cart Display Performance
 * Tests that cart opening is instant and doesn't block on API calls
 */

const puppeteer = require('puppeteer')

async function testInstantCartDisplay() {
  console.log('🧪 Testing instant cart display performance...')
  
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 100 // Slow down so we can see the instant response
  })
  
  try {
    const page = await browser.newPage()
    
    // Navigate to the homepage
    console.log('📱 Opening homepage...')
    await page.goto('http://localhost:3000')
    await page.waitForSelector('nav', { timeout: 10000 })
    
    // Wait for navigation to load
    await page.waitForTimeout(2000)
    
    // Test 1: Measure cart open time
    console.log('⏱️  Testing cart open speed...')
    const startTime = Date.now()
    
    // Click the cart button
    await page.click('button[aria-label*="cart" i], button[title*="cart" i], .cart-button, [data-testid="cart"]')
    
    // Wait for cart dropdown to appear
    await page.waitForSelector('[class*="cart"]', { visible: true, timeout: 5000 })
    
    const openTime = Date.now() - startTime
    console.log(`✅ Cart opened in ${openTime}ms`)
    
    if (openTime < 100) {
      console.log('🎉 EXCELLENT: Cart opens instantly (< 100ms)')
    } else if (openTime < 500) {
      console.log('✅ GOOD: Cart opens quickly (< 500ms)')
    } else {
      console.log('⚠️  SLOW: Cart takes too long to open (> 500ms)')
    }
    
    // Test 2: Check if cart shows items immediately
    console.log('📦 Checking cart content display...')
    
    // Close cart first
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)
    
    // Add an item to cart first
    console.log('🛒 Adding item to cart...')
    await page.goto('http://localhost:3000/products')
    await page.waitForSelector('button:has-text("Add to Cart")', { timeout: 5000 })
    await page.click('button:has-text("Add to Cart")')
    await page.waitForTimeout(1000) // Wait for optimistic update
    
    // Now test cart open speed with items
    console.log('⏱️  Testing cart open speed with items...')
    const startTime2 = Date.now()
    
    await page.click('button[aria-label*="cart" i], button[title*="cart" i], .cart-button, [data-testid="cart"]')
    await page.waitForSelector('[class*="cart"]', { visible: true, timeout: 5000 })
    
    const openTime2 = Date.now() - startTime2
    console.log(`✅ Cart with items opened in ${openTime2}ms`)
    
    if (openTime2 < 100) {
      console.log('🎉 EXCELLENT: Cart with items opens instantly (< 100ms)')
    } else if (openTime2 < 500) {
      console.log('✅ GOOD: Cart with items opens quickly (< 500ms)')
    } else {
      console.log('⚠️  SLOW: Cart with items takes too long to open (> 500ms)')
    }
    
    // Test 3: Check for loading states
    console.log('🔍 Checking for unwanted loading states...')
    const loadingElements = await page.$$('[class*="loading"], [class*="spinner"], .animate-spin')
    
    if (loadingElements.length === 0) {
      console.log('✅ NO loading spinners visible - cart shows instantly!')
    } else {
      console.log(`⚠️  Found ${loadingElements.length} loading elements - cart may not be instant`)
    }
    
    console.log('\n📊 PERFORMANCE SUMMARY:')
    console.log(`- Empty cart open time: ${openTime}ms`)
    console.log(`- Cart with items open time: ${openTime2}ms`)
    console.log(`- Loading elements found: ${loadingElements.length}`)
    
    if (openTime < 100 && openTime2 < 100 && loadingElements.length === 0) {
      console.log('🎉 SUCCESS: Cart display is INSTANT!')
    } else {
      console.log('⚠️  NEEDS IMPROVEMENT: Cart display could be faster')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    await browser.close()
  }
}

// Run the test
testInstantCartDisplay().catch(console.error) 