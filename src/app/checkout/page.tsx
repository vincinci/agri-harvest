'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Navigation from '../components/Navigation'

interface CartItem {
  id: string
  productId: number
  quantity: number
  price: number
  name: string
  image: string
}

interface CartSummary {
  itemsCount: number
  subtotal: number
  deliveryFee: number
  total: number
  currency: string
  message: string
}

interface CartData {
  items: CartItem[]
  summary: CartSummary
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function CheckoutPage() {
  const [cartData, setCartData] = useState<CartData | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  
  // Customer form data
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  })

  const sessionId = 'default' // In a real app, this would be from user session

  useEffect(() => {
    fetchCartData()
  }, [])

  const fetchCartData = async () => {
    try {
      const response = await fetch(`/api/cart?sessionId=${sessionId}`)
      const result = await response.json()
      
      if (result.success) {
        setCartData(result.data)
      }
    } catch (error) {
      console.log('Error fetching cart, using local state')
    }
  }

  // Instant optimistic quantity updates
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 0 || !cartData) return
    
    console.log(`⚡ INSTANT checkout update: ${itemId} → ${newQuantity}`)
    
    // Update UI instantly with optimized calculations
    setCartData(prev => {
      if (!prev) return null
      
      if (newQuantity === 0) {
        // Remove item instantly
        const filteredItems = prev.items.filter(item => item.id !== itemId)
        const newSubtotal = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const newItemsCount = filteredItems.reduce((sum, item) => sum + item.quantity, 0)
        
        return {
          ...prev,
          items: filteredItems,
          summary: {
            ...prev.summary,
            itemsCount: newItemsCount,
            subtotal: newSubtotal,
            total: newSubtotal + prev.summary.deliveryFee
          }
        }
      } else {
        // Update quantity instantly
        const updatedItems = prev.items.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
        
        const newSubtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const newItemsCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        
        return {
          ...prev,
          items: updatedItems,
          summary: {
            ...prev.summary,
            itemsCount: newItemsCount,
            subtotal: newSubtotal,
            total: newSubtotal + prev.summary.deliveryFee
          }
        }
      }
    })
    
    // Sync with backend silently (no UI interference)
    syncQuantityWithBackend(itemId, newQuantity)
  }

  // Silent background sync
  const syncQuantityWithBackend = async (itemId: string, newQuantity: number) => {
    try {
      if (newQuantity === 0) {
        await fetch('/api/cart', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId })
        })
      } else {
        await fetch('/api/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, quantity: newQuantity })
        })
      }
      console.log(`✅ Synced ${itemId} with backend`)
    } catch (error) {
      console.log('Background sync failed for item:', itemId)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!cartData || cartData.items.length === 0) {
      alert('Your cart is empty')
      return
    }

    if (!customerData.name || !customerData.email) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setCheckoutLoading(true)
      setPaymentError(null)
      
      // Generate unique transaction reference
      const tx_ref = `RW_GREENHOUSE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // First, initiate payment with Flutterwave
      const paymentResponse = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cartData.summary.total,
          currency: 'RWF',
          email: customerData.email,
          phone_number: customerData.phone,
          name: customerData.name,
          tx_ref: tx_ref,
          redirect_url: `${window.location.origin}/payment/callback`
        })
      })
      
      const paymentResult = await paymentResponse.json()
      
      if (paymentResult.success) {
        // Payment link generated successfully - redirect to Flutterwave
        if (paymentResult.data?.link) {
          // Store order info in localStorage for callback handling
          localStorage.setItem('pendingOrder', JSON.stringify({
            tx_ref: tx_ref,
            customerData: customerData,
            cartData: cartData,
            sessionId: sessionId
          }));
          
          // Redirect to Flutterwave payment page
          window.location.href = paymentResult.data.link;
          return;
        } else {
          setPaymentError('Payment link not received from Flutterwave');
        }
      } else {
        setPaymentError('Payment failed: ' + paymentResult.error);
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      setPaymentError('Payment processing failed. Please try again.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div 
            className="text-center bg-white rounded-2xl shadow-lg p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
            </motion.div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
            <p className="text-xl text-gray-600 mb-2">Thank you for your order, {customerData.name}!</p>
            <p className="text-gray-600 mb-8">
              Order ID: <span className="font-semibold text-green-600">#{orderId}</span>
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
              <p className="text-green-800">
                📧 A confirmation email has been sent to <strong>{customerData.email}</strong>
              </p>
              <p className="text-green-800 mt-2">
                🚚 Your fresh vegetables will be delivered within 24 hours!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <motion.button
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Continue Shopping
                </motion.button>
              </Link>
              <Link href="/">
                <motion.button
                  className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Back to Home
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation cartCount={cartData?.summary?.itemsCount || 0} />
      
      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.h1 
          className="text-4xl font-bold text-gray-900 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ShoppingCart className="inline-block h-10 w-10 mr-4 text-green-600" />
          Checkout
        </motion.h1>

        {!cartData || cartData.items.length === 0 ? (
          <motion.div 
            className="text-center bg-white rounded-2xl shadow-lg p-12"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Start shopping to add some fresh vegetables to your cart!</p>
            <Link href="/products">
              <motion.button
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Shop Now
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <motion.div 
              className="lg:col-span-2"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Items</h2>
                
                <div className="space-y-4">
                  {cartData.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg bg-white"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="w-16 h-16 relative flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/placeholder-vegetable.svg';
                          }}
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-green-600 font-semibold">{item.price.toLocaleString()} RWF</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <motion.button
                          className="p-1 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Minus className="h-4 w-4" />
                        </motion.button>
                        
                        <span className="w-8 text-center font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        
                        <motion.button
                          className="p-1 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Plus className="h-4 w-4" />
                        </motion.button>
                      </div>
                      
                      <motion.button
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        onClick={() => updateQuantity(item.id, 0)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                      
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {(item.price * item.quantity).toLocaleString()} RWF
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Checkout Form & Summary */}
            <motion.div 
              className="space-y-6"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.2 }}
            >
              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Subtotal ({cartData.summary.itemsCount} items)</span>
                    <span className="font-semibold text-gray-900">{cartData.summary.subtotal.toLocaleString()} RWF</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-700">Delivery Fee</span>
                    <span className="font-semibold text-gray-900">
                      {cartData.summary.deliveryFee === 0 ? 'FREE' : `${cartData.summary.deliveryFee.toLocaleString()} RWF`}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-green-600">{cartData.summary.total.toLocaleString()} RWF</span>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                    <p className="text-sm text-green-800 font-medium">{cartData.summary.message}</p>
                  </div>
                </div>
              </div>

              {/* Customer Information Form */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-black mb-4">Customer Information</h3>
                
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div>
                    <label htmlFor="customer-name" className="block text-sm font-medium text-black mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="customer-name"
                      type="text"
                      value={customerData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="customer-email" className="block text-sm font-medium text-black mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="customer-email"
                      type="email"
                      value={customerData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="customer-phone" className="block text-sm font-medium text-black mb-1">
                      Phone Number
                    </label>
                    <input
                      id="customer-phone"
                      type="tel"
                      value={customerData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                      placeholder="+250 788 123 456"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="delivery-address" className="block text-sm font-medium text-black mb-1">
                      Delivery Address
                    </label>
                    <textarea
                      id="delivery-address"
                      value={customerData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-20 resize-none text-black"
                      placeholder="Enter your delivery address in Kigali"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="special-notes" className="block text-sm font-medium text-black mb-1">
                      Special Notes
                    </label>
                    <textarea
                      id="special-notes"
                      value={customerData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-16 resize-none text-black"
                      placeholder="Any special instructions for delivery..."
                    />
                  </div>
                  
                  {paymentError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">{paymentError}</p>
                    </div>
                  )}
                  
                  <motion.button
                    type="submit"
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={checkoutLoading}
                    whileHover={!checkoutLoading ? { scale: 1.02 } : {}}
                    whileTap={!checkoutLoading ? { scale: 0.98 } : {}}
                  >
                    {checkoutLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <span>Pay with Flutterwave</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
} 