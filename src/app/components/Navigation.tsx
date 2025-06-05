'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Search, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'
import SearchResultsPopup from './SearchResultsPopup'

// Types for cart
interface CartItem {
  id: string
  productId: number
  quantity: number
  price: number
  name: string
  image: string
}

interface NavigationProps {
  cartCount?: number
}

export default function Navigation({ cartCount: initialCartCount = 0 }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [cartCount, setCartCount] = useState(initialCartCount)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [addingToCart, setAddingToCart] = useState<number | null>(null)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const cartDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCartCount(initialCartCount)
  }, [initialCartCount])

  // Fetch cart data in background periodically (no UI blocking)
  const fetchCartData = useCallback(async () => {
    try {
      console.log('🔄 Background cart sync starting...')
      const response = await fetch('/api/cart?sessionId=default')
      
      if (!response.ok) {
        console.log('❌ Background cart sync failed with status:', response.status)
        return
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.log('❌ Background cart sync returned non-JSON response')
        return
      }
      
      const result = await response.json()
      console.log('📦 Background cart sync data received:', result)
      
      if (result.success) {
        // Only update if data is different to prevent unnecessary re-renders
        const newItems = result.data.items || []
        const newCount = result.data.summary.itemsCount || 0
        
        setCartItems(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(newItems)) {
            console.log(`🔄 Background sync updated cart items: ${newItems.length} items`)
            return newItems
          }
          return prev
        })
        
        setCartCount(prev => {
          if (prev !== newCount) {
            console.log(`🔄 Background sync updated cart count: ${newCount}`)
            return newCount
          }
          return prev
        })
      } else {
        console.log('❌ Background cart sync API returned error:', result.error)
      }
    } catch (error) {
      console.log('❌ Background cart sync failed:', error)
    }
  }, [])

  // Load cart data on component mount (background only)
  useEffect(() => {
    const fetchInitialCartCount = async () => {
      try {
        console.log('🔄 Loading initial cart data in background...')
        await fetchCartData()
      } catch (error) {
        console.log('Failed to fetch initial cart data:', error)
      }
    }
    
    fetchInitialCartCount()
    
    // Set up periodic background sync every 30 seconds
    const interval = setInterval(() => {
      if (!isCartOpen) { // Only sync when cart is closed to avoid interfering
        fetchCartData()
      }
    }, 30000)
    
    return () => clearInterval(interval)
  }, [fetchCartData])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target as Node)) {
        setIsCartOpen(false)
      }
    }

    if (isCartOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isCartOpen])

  // Update cart item quantity (optimistic updates only)
  const updateCartQuantity = useCallback(async (itemId: string, newQuantity: number) => {
    const currentItem = cartItems.find(item => item.id === itemId)
    if (!currentItem) return
    
    console.log(`⚡ INSTANT update: ${currentItem.name}: ${currentItem.quantity} → ${newQuantity}`)
    
    // Update UI instantly - this is the only update users see
    if (newQuantity <= 0) {
      setCartItems(prev => prev.filter(item => item.id !== itemId))
      setCartCount(prev => Math.max(0, prev - currentItem.quantity))
    } else {
      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      )
      const quantityDiff = newQuantity - currentItem.quantity
      setCartCount(prev => Math.max(0, prev + quantityDiff))
    }
    
    // Silent background sync - no UI updates
    try {
      await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          quantity: newQuantity,
          sessionId: 'default'
        })
      })
      console.log(`✅ Background sync completed for ${currentItem.name}`)
    } catch (error) {
      console.log('❌ Background sync failed:', error)
    }
  }, [cartItems])

  // Handle typing in quantity input (instant updates)
  const handleQuantityChange = (item: CartItem, value: string) => {
    setEditValue(value)
    
    // Update instantly on every keystroke
    const numValue = value === '' ? 0 : parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0) {
      updateCartQuantity(item.id, numValue)
    }
  }

  const handleQuantityBlur = (item: CartItem) => {
    setEditingItem(null)
    setEditValue('')
  }

  const handleQuantityKeyDown = (e: React.KeyboardEvent, item: CartItem) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setEditingItem(null)
      setEditValue('')
      ;(e.target as HTMLInputElement).blur()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setEditingItem(null)
      setEditValue('')
      ;(e.target as HTMLInputElement).blur()
    }
  }

  const startEdit = (item: CartItem) => {
    setEditingItem(item.id)
    setEditValue(item.quantity.toString())
  }

  // Clear entire cart
  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your entire cart?')) {
      return
    }
    
    try {
      console.log('🗑️ Clearing entire cart...')
      const response = await fetch('/api/cart?sessionId=default', {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setCartItems([])
        setCartCount(0)
        console.log('✅ Cart cleared successfully')
      } else {
        console.log('❌ Failed to clear cart')
        alert('Failed to clear cart. Please try again.')
      }
    } catch (error) {
      console.log('❌ Error clearing cart:', error)
      alert('Error clearing cart. Please try again.')
    }
  }

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  const handleCartClick = () => {
    console.log('🛒 Cart clicked - opening instantly!')
    setIsCartOpen(!isCartOpen)
    
    // Optional: trigger a background sync when cart opens (non-blocking)
    if (!isCartOpen) {
      fetchCartData() // This runs in background, doesn't block UI
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setIsSearchFocused(false)
      setIsSearchPopupOpen(false)
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    // Show search popup when there's a query
    setIsSearchPopupOpen(!!value.trim())
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsSearchFocused(false)
      setSearchQuery('')
      setIsSearchPopupOpen(false)
    }
  }

  const handleSearchPopupClose = () => {
    setIsSearchPopupOpen(false)
  }

  const handleSearchResultSelect = (result: any) => {
    router.push(`/products?search=${encodeURIComponent(result.name)}`)
    setIsSearchPopupOpen(false)
    setSearchQuery('')
  }

  const handleSearchPopupAddToCart = async (product: any) => {
    // Prevent multiple rapid clicks on the same product
    if (addingToCart === product.id) {
      console.log('🚫 Already adding this product to cart from navigation search, ignoring duplicate request')
      return
    }

    try {
      console.log(`⚡ INSTANT add to cart from navigation search: ${product.name} (ID: ${product.id})`)
      setAddingToCart(product.id)
      
      // Instant optimistic update - add to cart items immediately
      const newItem: CartItem = {
        id: `temp-${Date.now()}`, // Temporary ID for immediate display
        productId: product.id,
        quantity: 1,
        price: product.price,
        name: product.name,
        image: product.image
      }
      setCartItems(prev => [...prev, newItem])
      setCartCount(prev => prev + 1)
      setIsSearchPopupOpen(false) // Close search popup immediately
      console.log(`✅ Instantly added ${product.name} to cart from navigation search!`)
      
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
          // Trigger a background refresh to get the real item ID
          setTimeout(() => fetchCartData(), 500)
        } else {
          console.log(`❌ Background sync failed for ${product.name}`)
        }
      }).catch(error => {
        console.log('❌ Background sync error:', error)
      })
      
    } catch (error) {
      console.error('Error in add to cart from navigation search:', error)
    } finally {
      // Clear loading state instantly
      setAddingToCart(null)
    }
  }

  return (
    <>
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-40 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <Link href="/" className="flex items-center">
              <img 
                src="/images/agriharvest-logo.png" 
                alt="AgriHarvest Logo" 
                className="h-20 w-auto"
              />
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                href="/" 
                className={`transition-colors ${
                  isActive('/') && pathname === '/' 
                    ? 'text-green-600 font-semibold' 
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                Home
              </Link>
              
              <Link 
                href="/products" 
                className={`transition-colors ${
                  isActive('/products') 
                    ? 'text-green-600 font-semibold' 
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                Products
              </Link>
              
              <Link 
                href="/about" 
                className={`transition-colors ${
                  isActive('/about') 
                    ? 'text-green-600 font-semibold' 
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className={`transition-colors ${
                  isActive('/contact') 
                    ? 'text-green-600 font-semibold' 
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                Contact
              </Link>
            </div>

            {/* Search and Cart Section */}
            <div className="flex items-center space-x-4">
              {/* Compact Search Bar */}
              <motion.form
                onSubmit={handleSearch}
                className="hidden lg:flex items-center"
                initial={false}
                animate={{
                  width: isSearchFocused ? 280 : 200
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white text-black placeholder-gray-400"
                  />
                </div>
              </motion.form>

              {/* Mobile Search Button */}
              <Link
                href="/products"
                className="lg:hidden p-2 text-gray-700 hover:text-green-600 transition-colors"
              >
                <Search className="h-5 w-5" />
              </Link>
              
              {/* Cart Button with Dropdown */}
              <div className="relative" ref={cartDropdownRef}>
                <motion.button
                  onClick={handleCartClick}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">Cart</span>
                  {cartItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </motion.button>

                {/* Cart Dropdown */}
                <AnimatePresence>
                  {isCartOpen && (
                    <motion.div
                      className="absolute right-0 top-full mt-2 w-96 bg-white shadow-2xl border border-gray-200 rounded-2xl z-50"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
                        <div>
                          <h3 className="font-bold text-gray-900 flex items-center">
                            <ShoppingCart className="h-5 w-5 mr-2 text-green-600" />
                            Your Cart
                          </h3>
                          <p className="text-sm text-gray-600">
                            {cartItems.length > 0 
                              ? `${cartItems.length} product${cartItems.length > 1 ? 's' : ''} (${cartCount} total items)` 
                              : 'Empty cart'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {cartItems.length > 0 && (
                            <button
                              onClick={clearCart}
                              className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors text-xs"
                              title="Clear Cart"
                            >
                              🗑️
                            </button>
                          )}
                          <button
                            onClick={() => setIsCartOpen(false)}
                            className="p-2 hover:bg-white/80 rounded-lg transition-colors"
                            title="Close Cart"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Cart Items */}
                      <div className="max-h-80 overflow-y-auto">
                        {cartItems.length === 0 ? (
                          <div className="text-center p-8">
                            <div className="text-4xl mb-3">🛒</div>
                            <p className="text-gray-600 mb-4">Your cart is empty</p>
                            <button
                              onClick={() => setIsCartOpen(false)}
                              className="text-green-600 hover:text-green-700 font-medium text-sm"
                            >
                              Continue Shopping
                            </button>
                          </div>
                        ) : (
                          <div className="p-4 space-y-3">
                            {cartItems.map((item) => (
                              <motion.div
                                key={item.id}
                                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl"
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                              >
                                {/* Product Image */}
                                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg overflow-hidden shadow-sm">
                                  {item.image.startsWith('http') ? (
                                    <img 
                                      src={item.image} 
                                      alt={item.name}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-lg">
                                      {item.image}
                                    </div>
                                  )}
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 truncate text-sm">
                                    {item.name}
                                  </h4>
                                  <p className="text-green-600 font-semibold text-sm">
                                    {item.price.toLocaleString()} RWF
                                  </p>
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => updateCartQuantity(item.id, Math.max(0, item.quantity - 1))}
                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="h-3 w-3 text-gray-700" />
                                  </button>
                                  
                                  {editingItem === item.id ? (
                                    <input
                                      type="number"
                                      value={editValue}
                                      onChange={(e) => handleQuantityChange(item, e.target.value)}
                                      onBlur={() => handleQuantityBlur(item)}
                                      onKeyDown={(e) => handleQuantityKeyDown(e, item)}
                                      className={`w-12 px-1 py-1 text-center text-xs border-2 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 text-black ${
                                        item.quantity >= 10 
                                          ? 'bg-red-50 border-red-500' 
                                          : 'bg-green-50 border-green-500'
                                      }`}
                                      min="0"
                                      step="0.1"
                                      autoFocus
                                      aria-label={`Quantity for ${item.name}`}
                                    />
                                  ) : (
                                    <button
                                      onClick={() => startEdit(item)}
                                      className={`w-12 px-1 py-1 text-center text-xs font-medium rounded hover:bg-gray-50 transition-colors border border-gray-300 ${
                                        item.quantity >= 10 
                                          ? 'text-red-600 bg-red-50 border-red-300' 
                                          : 'text-black bg-white'
                                      }`}
                                    >
                                      {item.quantity}
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="h-3 w-3 text-gray-700" />
                                  </button>
                                  
                                  <button
                                    onClick={() => updateCartQuantity(item.id, 0)}
                                    className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors"
                                    aria-label="Remove item"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer with checkout */}
                      {cartItems.length > 0 && (
                        <div className="border-t border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-b-2xl">
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">Total ({cartItems.length} products, {cartCount} items)</span>
                              <span className="font-semibold text-gray-900">
                                {cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()} RWF
                              </span>
                            </div>
                          </div>

                          <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
                            <motion.button
                              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <span>Checkout</span>
                              <ArrowRight className="h-4 w-4" />
                            </motion.button>
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Results Popup */}
      <SearchResultsPopup 
        searchQuery={searchQuery}
        isVisible={isSearchPopupOpen}
        onClose={handleSearchPopupClose}
        onProductSelect={handleSearchResultSelect}
        onAddToCart={handleSearchPopupAddToCart}
      />
    </>
  )
} 