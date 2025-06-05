'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Filter, Star, Heart, Search } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Navigation from '../components/Navigation'
import SearchResultsPopup from '../components/SearchResultsPopup'
import SearchBar from '../components/SearchBar'

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

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [addingToCart, setAddingToCart] = useState<number | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>(['all'])
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false)

  // Map category names from navigation to search queries
  const categoryMapping: { [key: string]: string } = {
    'All Vegetables': 'all',
    'Leafy Greens': 'lettuce',
    'Peppers': 'pepper',
    'Cucumbers': 'cucumber',
    'Tomatoes': 'tomato',
    'Onions & Roots': 'onion'
  }

  // Handle URL search parameters
  useEffect(() => {
    const urlSearch = searchParams.get('search')
    const urlCategory = searchParams.get('category')
    
    if (urlSearch) {
      setSearchQuery(urlSearch)
    }
    
    if (urlCategory) {
      // Map the category name to appropriate filter
      const mappedCategory = categoryMapping[urlCategory] || urlCategory.toLowerCase()
      if (mappedCategory === 'all') {
        setSelectedCategory('all')
        setSearchQuery('')
      } else {
        setSelectedCategory('all') // Show all categories
        setSearchQuery(mappedCategory) // Use as search query
      }
    }
  }, [searchParams])

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = `/api/products?category=${selectedCategory}`
        
        // Add search query if it exists
        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`
        }
        
        const response = await fetch(url)
        
        // Check if response is ok and content type is JSON
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Server returned non-JSON response, likely an error page')
          return
        }
        
        const result = await response.json()
        
        if (result.success) {
          setProducts(result.data)
          // Update categories if we're loading all products
          if (selectedCategory === 'all' && result.categories) {
            setCategories(['all', ...result.categories])
          }
        } else {
          console.error('API returned error:', result.error)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        // Set empty products array on error to prevent UI issues
        setProducts([])
      }
    }

    fetchProducts()
  }, [selectedCategory, searchQuery])

  // Fetch cart count on component mount
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const response = await fetch('/api/cart?sessionId=default')
        
        // Check if response is ok and content type is JSON
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Cart API returned non-JSON response')
          return
        }
        
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

    console.log(`⚡ INSTANT add to cart: ${product.name} (ID: ${product.id})`)
    
    // Brief loading state for visual feedback (just 50ms)
    setAddingToCart(product.id)
    
    // Instant optimistic update - update cart count immediately
    setCartCount(prev => prev + 1)
    
    // Clear loading state instantly for truly instant feel
    setTimeout(() => {
      setAddingToCart(null)
    }, 50)
    
    console.log(`✅ Instantly added ${product.name} to cart!`)
    
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

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Reset category to 'all' when searching to show all matching results
    if (query && selectedCategory !== 'all') {
      setSelectedCategory('all')
    }
    
    // Show search popup when there's a query
    setIsSearchPopupOpen(!!query.trim())
    
    // Update URL to reflect search
    const url = new URL(window.location.href)
    if (query) {
      url.searchParams.set('search', query)
      url.searchParams.delete('category') // Remove category when searching
    } else {
      url.searchParams.delete('search')
    }
    window.history.replaceState({}, '', url.toString())
  }

  const handleSearchResultSelect = (result: any) => {
    // Optional: Navigate to specific product or add to cart
    console.log('Selected product:', result)
    setIsSearchPopupOpen(false)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setIsSearchPopupOpen(false)
    
    // Update URL to remove search
    const url = new URL(window.location.href)
    url.searchParams.delete('search')
    url.searchParams.delete('category')
    window.history.replaceState({}, '', url.toString())
  }

  const handleSearchPopupClose = () => {
    setIsSearchPopupOpen(false)
  }

  const handleSearchPopupAddToCart = async (product: any) => {
    // Prevent multiple rapid clicks on the same product
    if (addingToCart === product.id) {
      console.log('Already adding this product to cart from search, ignoring duplicate request')
      return
    }

    console.log(`⚡ INSTANT add to cart from search: ${product.name} (ID: ${product.id})`)
    
    // Brief loading state for visual feedback (just 50ms)
    setAddingToCart(product.id)
    
    // Instant optimistic update - update cart count immediately
    setCartCount(prev => prev + 1)
    setIsSearchPopupOpen(false) // Close search popup immediately
    
    // Clear loading state instantly for truly instant feel
    setTimeout(() => {
      setAddingToCart(null)
    }, 50)
    
    console.log(`✅ Instantly added ${product.name} to cart from search!`)
    
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

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    
    // Clear search when changing categories
    if (category !== 'all') {
      setSearchQuery('')
    }
    
    // Update URL to reflect category
    const url = new URL(window.location.href)
    if (category !== 'all') {
      url.searchParams.set('category', category)
      url.searchParams.delete('search')
    } else {
      url.searchParams.delete('category')
      url.searchParams.delete('search')
    }
    window.history.replaceState({}, '', url.toString())
  }

  // Get result counts for display
  const getResultsText = () => {
    const urlCategory = searchParams.get('category')
    
    if (searchQuery) {
      const searchTerms = searchQuery.toLowerCase().split(/\s+/).filter(term => term.length > 0)
      if (searchTerms.length > 1) {
        return `${products.length} result${products.length !== 1 ? 's' : ''} containing "${searchTerms.join('" or "')}"`
      } else {
        return `${products.length} result${products.length !== 1 ? 's' : ''} for "${searchQuery}"`
      }
    }
    if (urlCategory && urlCategory !== 'all') {
      return `${products.length} product${products.length !== 1 ? 's' : ''} in ${urlCategory}`
    }
    if (selectedCategory !== 'all') {
      return `${products.length} product${products.length !== 1 ? 's' : ''} in ${selectedCategory}`
    }
    return `${products.length} product${products.length !== 1 ? 's' : ''} available`
  }

  // Function to highlight search terms in text
  const highlightSearchTerms = (text: string) => {
    if (!searchQuery) return text
    
    const searchTerms = searchQuery.toLowerCase().split(/\s+/).filter(term => term.length > 0)
    let highlightedText = text
    
    searchTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi')
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
    })
    
    return highlightedText
  }

  // Get current filter display text
  const getCurrentFilterText = () => {
    const urlCategory = searchParams.get('category')
    if (urlCategory) {
      return urlCategory
    }
    if (searchQuery) {
      return `Search: "${searchQuery}"`
    }
    return 'All Products'
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation cartCount={cartCount} />

      {/* Header */}
      <section className="pt-24 pb-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              Our Fresh Products
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Discover our complete selection of premium vegetables, each carefully grown 
              in our state-of-the-art greenhouse facilities with sustainable practices.
            </p>
            
            {/* Search Bar in Header */}
            <motion.div
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <SearchBar 
                onSearch={handleSearch}
                onResultSelect={handleSearchResultSelect}
                placeholder="Search for cucumbers, peppers, onions..."
                className="w-full"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Search Results Info & Filters */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Results Info */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-gray-600 text-lg">
              {getResultsText()}
            </p>
            {(searchQuery || searchParams.get('category')) && (
              <div className="mt-2 flex justify-center items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Showing: <span className="font-medium text-green-600">{getCurrentFilterText()}</span>
                </span>
                <button
                  onClick={clearSearch}
                  className="text-green-600 hover:text-green-700 font-medium text-sm"
                >
                  Clear filters
                </button>
              </div>
            )}
          </motion.div>

          {/* Category Filters */}
          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  selectedCategory === category && !searchQuery && !searchParams.get('category')
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category === 'all' ? 'All Products' : category.charAt(0).toUpperCase() + category.slice(1)}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {products.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-6xl mb-4">
                {searchQuery || searchParams.get('category') ? '🔍' : '🥬'}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery 
                  ? `No products found for "${searchQuery}"` 
                  : searchParams.get('category')
                  ? `No products found in "${searchParams.get('category')}"` 
                  : 'No products found'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || searchParams.get('category')
                  ? 'Try searching for something else or browse our categories.' 
                  : 'Try selecting a different category.'}
              </p>
              {(searchQuery || searchParams.get('category')) && (
                <button
                  onClick={clearSearch}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Clear Filters
                </button>
              )}
            </motion.div>
          )}

          {products.length > 0 && (
            <motion.div
              className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="bg-gray-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                  custom={index}
                >
                  <div className="text-center mb-4">
                    <motion.div
                      className="mb-4 flex justify-center items-center h-40 bg-white rounded-lg p-2"
                      whileHover={{ scale: 1.05, rotate: 2 }}
                    >
                      {product.image.startsWith('http') ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                        />
                      ) : (
                        <div className="text-4xl">{product.image}</div>
                      )}
                    </motion.div>
                    <h3 
                      className="text-lg font-semibold text-gray-900"
                      dangerouslySetInnerHTML={{ __html: highlightSearchTerms(product.name) }}
                    />
                    <p 
                      className="text-sm text-gray-600 mt-1"
                      dangerouslySetInnerHTML={{ __html: highlightSearchTerms(product.description) }}
                    />
                  </div>

                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span className="font-semibold text-green-600">{product.price.toLocaleString()} RWF</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span className="capitalize">{product.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stock:</span>
                      <span className="text-green-600">{product.quantity} kg available</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Rating:</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span>4.8/5</span>
                      </div>
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={() => addToCart(product)}
                    disabled={addingToCart === product.id}
                    className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    whileHover={addingToCart !== product.id ? { scale: 1.02 } : {}}
                    whileTap={addingToCart !== product.id ? { scale: 0.98 } : {}}
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
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Search Results Popup */}
      <SearchResultsPopup
        searchQuery={searchQuery}
        isVisible={isSearchPopupOpen}
        onClose={handleSearchPopupClose}
        onProductSelect={handleSearchResultSelect}
        onAddToCart={handleSearchPopupAddToCart}
      />
    </div>
  )
} 