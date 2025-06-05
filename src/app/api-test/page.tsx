'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Leaf, ShoppingCart, TestTube, Package, User, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ApiTestPage() {
  const [products, setProducts] = useState<any[]>([])
  const [cart, setCart] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: ''
  })

  // Fetch products
  const fetchProducts = async (category = 'all') => {
    setLoading(true)
    try {
      const response = await fetch(`/api/products?category=${category}`)
      const result = await response.json()
      setProducts(result.data)
      setMessage(`✅ Loaded ${result.count} products from database`)
    } catch (error) {
      setMessage('❌ Error fetching products')
    }
    setLoading(false)
  }

  // Fetch cart
  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart?sessionId=demo')
      const result = await response.json()
      setCart(result.data)
    } catch (error) {
      setMessage('❌ Error fetching cart')
    }
  }

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const result = await response.json()
      setOrders(result.data)
      setMessage(`✅ Loaded ${result.count} orders from database`)
    } catch (error) {
      setMessage('❌ Error fetching orders')
    }
  }

  // Add to cart
  const addToCart = async (product: any) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          sessionId: 'demo'
        })
      })
      const result = await response.json()
      setMessage(`✅ ${result.message}`)
      fetchCart() // Refresh cart
    } catch (error) {
      setMessage('❌ Error adding to cart')
    }
  }

  // Clear cart
  const clearCart = async () => {
    try {
      const response = await fetch('/api/cart?sessionId=demo', {
        method: 'DELETE'
      })
      const result = await response.json()
      setMessage(`✅ ${result.message}`)
      fetchCart() // Refresh cart
    } catch (error) {
      setMessage('❌ Error clearing cart')
    }
  }

  // Create order
  const createOrder = async () => {
    if (!customerData.name || !customerData.email) {
      setMessage('❌ Please fill in name and email')
      return
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerData.name,
          customerEmail: customerData.email,
          customerPhone: customerData.phone,
          sessionId: 'demo'
        })
      })
      const result = await response.json()
      
      if (result.success) {
        setMessage(`✅ ${result.message} - Order ID: ${result.data.id}`)
        setShowCheckout(false)
        setCustomerData({ name: '', email: '', phone: '' })
        fetchCart() // Refresh cart
        fetchOrders() // Refresh orders
      } else {
        setMessage(`❌ ${result.error}`)
      }
    } catch (error) {
      setMessage('❌ Error creating order')
    }
  }

  useEffect(() => {
    const testApi = async () => {
      try {
        console.log('Testing API...')
        const response = await fetch('/api/products')
        console.log('Response status:', response.status)
        
        const result = await response.json()
        console.log('API Result:', result)
        
        setApiResponse(result)
        
        if (result.success) {
          setProducts(result.data)
        } else {
          setError(result.error)
        }
      } catch (err) {
        console.error('API Error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    testApi()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Test Page</h1>
        
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Status</h2>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-600">Error: {error}</p>}
          {!loading && !error && <p className="text-green-600">✅ API working successfully!</p>}
        </div>

        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Raw API Response</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Products ({products.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4">
                <div className="mb-2">
                  {product.image.startsWith('http') ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-32 h-32 object-cover rounded-lg shadow-md mx-auto"
                    />
                  ) : (
                    <div className="text-2xl text-center">{product.image}</div>
                  )}
                </div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.description}</p>
                <p className="text-lg font-bold text-green-600 mt-2">
                  {product.price.toLocaleString()} RWF
                </p>
                <p className="text-sm text-gray-500">
                  Category: {product.category} | Stock: {product.quantity}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 