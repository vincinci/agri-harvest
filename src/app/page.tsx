'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ArrowRight, Star, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from './components/Navigation'
import SearchResultsPopup from './components/SearchResultsPopup'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function HomePage() {
  const router = useRouter()
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cartCount, setCartCount] = useState(0)
  const [addingToCart, setAddingToCart] = useState<number | null>(null)
  const [heroSearchQuery, setHeroSearchQuery] = useState('')
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false)

  // Fetch featured products from API
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      console.log('🔍 Starting to fetch featured products...')
      
      try {
        setLoading(true)
        console.log('📡 Making API request to /api/products')
        
        const response = await fetch('/api/products')
        console.log('📥 Response received:', response.status, response.ok)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        console.log('✅ API Response:', result)
        
        if (result.success && result.data && Array.isArray(result.data)) {
          const featured = result.data.slice(0, 6)
          setFeaturedProducts(featured)
          console.log(`🎉 Successfully loaded ${featured.length} featured products:`, featured.map((p: any) => p.name))
        } else {
          console.warn('⚠️ API returned unexpected format:', result)
          setFeaturedProducts([])
        }
      } catch (error) {
        console.error('❌ Error fetching featured products:', error)
        setFeaturedProducts([])
      } finally {
        setLoading(false)
        console.log('🏁 Fetch process completed')
      }
    }

    console.log('🚀 useEffect triggered - will fetch products')
    fetchFeaturedProducts()
  }, [])

  // Fetch cart count on component mount
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const response = await fetch('/api/cart?sessionId=default')
        const result = await response.json()
        if (result.success) {
          setCartCount(result.data.summary.itemsCount)
        }
      } catch (error) {
        console.error('Error fetching cart:', error)
      }
    }

    fetchCartCount()
  }, [])

  const addToCart = async (product: any) => {
    // Prevent multiple rapid clicks on the same product
    if (addingToCart === product.id) {
      console.log('Already adding this product to cart, ignoring duplicate request')
      return
    }

    console.log(`⚡ INSTANT add to cart from home: ${product.name} (ID: ${product.id})`)
    
    // Brief loading state for visual feedback (just 50ms)
    setAddingToCart(product.id)
    
    // Instant optimistic update - update cart count immediately
    setCartCount(prev => prev + 1)
    
    // Clear loading state instantly for truly instant feel
    setTimeout(() => {
      setAddingToCart(null)
    }, 50)
    
    console.log(`✅ Instantly added ${product.name} to cart from home!`)
    
    // Background API call - don't wait for response
    fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        quantity: 1,
        sessionId: 'default'
      })
    }).then(response => {
      if (response.ok) {
        console.log(`🔄 Background sync completed for ${product.name}`)
      } else {
        console.log(`❌ Background sync failed for ${product.name}`)
      }
    }).catch(error => {
      console.log('❌ Background sync error:', error)
    })
  }

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (heroSearchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(heroSearchQuery.trim())}`)
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setHeroSearchQuery(value)
    
    // Show search popup when there's a query
    setIsSearchPopupOpen(!!value.trim())
  }

  const handleSearchPopupClose = () => {
    setIsSearchPopupOpen(false)
  }

  const handleSearchResultSelect = (result: any) => {
    router.push(`/products?search=${encodeURIComponent(result.name)}`)
    setIsSearchPopupOpen(false)
    setHeroSearchQuery('')
  }

  const handleSearchPopupAddToCart = async (product: any) => {
    // Prevent multiple rapid clicks on the same product
    if (addingToCart === product.id) {
      console.log('Already adding this product to cart from search, ignoring duplicate request')
      return
    }

    console.log(`⚡ INSTANT add to cart from home search: ${product.name} (ID: ${product.id})`)
    
    // Brief loading state for visual feedback (just 50ms)
    setAddingToCart(product.id)
    
    // Instant optimistic update - update cart count immediately
    setCartCount(prev => prev + 1)
    setIsSearchPopupOpen(false) // Close search popup immediately
    
    // Clear loading state instantly for truly instant feel
    setTimeout(() => {
      setAddingToCart(null)
    }, 50)
    
    console.log(`✅ Instantly added ${product.name} to cart from home search!`)
    
    // Background API call - don't wait for response
    fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        quantity: 1,
        sessionId: 'default'
      })
    }).then(response => {
      if (response.ok) {
        console.log(`🔄 Background sync completed for ${product.name}`)
      } else {
        console.log(`❌ Background sync failed for ${product.name}`)
      }
    }).catch(error => {
      console.log('❌ Background sync error:', error)
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation cartCount={cartCount} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-white"
            style={{ color: '#ffffff' }}
          >
            <motion.div
              className="text-6xl mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              🌱
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ color: '#ffffff' }}>
              Fresh from our
              <span className="block text-green-400 mt-2" style={{ color: '#4ade80' }}>Greenhouse</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{ color: '#e5e7eb' }}>
              Experience the finest selection of naturally grown vegetables, harvested daily from our state-of-the-art greenhouse facilities.
            </p>

            {/* Hero Search Bar */}
            <motion.div
              className="max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <form onSubmit={handleHeroSearch} className="relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                  <input
                    type="text"
                    value={heroSearchQuery}
                    onChange={handleSearchInputChange}
                    placeholder="Search for cucumbers, peppers, onions, and more..."
                    className="w-full pl-12 pr-32 py-4 text-lg border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white text-black placeholder-gray-500 shadow-lg"
                    style={{ backgroundColor: '#ffffff', color: '#000000' }}
                  />
                  <motion.button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors font-semibold shadow-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ backgroundColor: '#059669', color: '#ffffff' }}
                  >
                    Search
                  </motion.button>
                </div>
              </form>
              
              {/* Quick Search Suggestions */}
              <motion.div
                className="flex flex-wrap justify-center gap-2 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
              >
                <span className="text-sm mr-2" style={{ color: '#d1d5db' }}>Popular:</span>
                {['Cucumbers', 'Peppers', 'Onions'].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setHeroSearchQuery(term)
                      router.push(`/products?search=${encodeURIComponent(term)}`)
                    }}
                    className="text-sm px-3 py-1 rounded-full transition-colors border"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                      color: '#ffffff',
                      borderColor: 'rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    {term}
                  </button>
                ))}
              </motion.div>
            </motion.div>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <Link href="/products">
                <motion.button
                  className="px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg border-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ 
                    backgroundColor: '#059669', 
                    color: '#ffffff',
                    borderColor: '#059669'
                  }}
                >
                  Shop Now
                </motion.button>
              </Link>
              <Link href="/about">
                <motion.button
                  className="border-2 px-8 py-4 rounded-full text-lg font-semibold transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ 
                    borderColor: '#ffffff',
                    color: '#ffffff',
                    backgroundColor: 'transparent'
                  }}
                >
                  Learn More
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 border-2 rounded-full flex justify-center"
            style={{ borderColor: '#ffffff' }}
          >
            <div className="w-1 h-3 rounded-full mt-2" style={{ backgroundColor: '#ffffff' }}></div>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our top 6 premium vegetables, each one carefully grown 
              and harvested at peak freshness in our state-of-the-art greenhouses.
            </p>
          </motion.div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">Loading fresh products...</p>
              <p className="mt-2 text-sm text-gray-500">This may take a few seconds...</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                >
                  <div className="text-center mb-4">
                    <div className="flex justify-center items-center h-32 bg-gray-50 rounded-lg p-2 mb-2">
                      {product.image.startsWith('http') ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                        />
                      ) : (
                        <div className="text-4xl">{product.image}</div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{product.quantity} kg available</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <span className="text-lg font-bold text-green-600">{product.price.toLocaleString()} RWF</span>
                      <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                    </div>
                    <motion.button
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      whileHover={addingToCart !== product.id ? { scale: 1.05 } : {}}
                      whileTap={addingToCart !== product.id ? { scale: 0.95 } : {}}
                      onClick={() => addToCart(product)}
                      disabled={addingToCart === product.id}
                    >
                      {addingToCart === product.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Adding...</span>
                        </>
                      ) : (
                        <span>Add to Cart</span>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🥬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Unable to load products
              </h3>
              <p className="text-gray-600 mb-4">
                We're having trouble loading our fresh products. Please try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Refresh Page
              </button>
            </div>
          )}
          
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Link href="/products">
              <motion.button
                className="bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition-all inline-flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>View All Products</span>
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid md:grid-cols-4 gap-8 text-center"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { number: "10,000+", label: "Happy Customers" },
              { number: "50+", label: "Vegetable Varieties" },
              { number: "365", label: "Days Fresh Supply" },
              { number: "100%", label: "Natural Guarantee" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
              >
                <div className="text-4xl font-bold text-green-400 mb-2">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Experience Fresh?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust us for their daily fresh vegetable needs.
            </p>
            <Link href="/products">
              <motion.button
                className="bg-white text-green-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Shopping Today
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Search Results Popup */}
      <SearchResultsPopup
        searchQuery={heroSearchQuery}
        isVisible={isSearchPopupOpen}
        onClose={handleSearchPopupClose}
        onProductSelect={handleSearchResultSelect}
        onAddToCart={handleSearchPopupAddToCart}
      />
    </div>
  )
}
