'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from '../../components/Navigation'

function PaymentCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [message, setMessage] = useState('')
  const [orderId, setOrderId] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        const tx_ref = searchParams.get('tx_ref')
        const transaction_id = searchParams.get('transaction_id')
        const flw_status = searchParams.get('status')

        if (!tx_ref) {
          setStatus('failed')
          setMessage('Transaction reference not found')
          return
        }

        // Get pending order data from localStorage
        const pendingOrderData = localStorage.getItem('pendingOrder')
        if (!pendingOrderData) {
          setStatus('failed')
          setMessage('Order data not found')
          return
        }

        const orderData = JSON.parse(pendingOrderData)

        // Verify payment with Flutterwave
        const verifyResponse = await fetch(`/api/payment?tx_ref=${tx_ref}`)
        const verifyResult = await verifyResponse.json()

        if (verifyResult.success && flw_status === 'successful') {
          // Payment verified successfully - create order
          const orderResponse = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerName: orderData.customerData.name,
              customerEmail: orderData.customerData.email,
              customerPhone: orderData.customerData.phone,
              customerAddress: orderData.customerData.address,
              customerNotes: orderData.customerData.notes,
              sessionId: orderData.sessionId,
              paymentRef: tx_ref,
              paymentAmount: orderData.cartData.summary.total,
              paymentStatus: 'COMPLETED'
            })
          })

          const orderResult = await orderResponse.json()

          if (orderResult.success) {
            setOrderId(orderResult.data.id)
            setStatus('success')
            setMessage('Payment successful! Your order has been placed.')
            
            // Clear cart and pending order data
            localStorage.removeItem('pendingOrder')
          } else {
            setStatus('failed')
            setMessage('Payment verified but order creation failed: ' + orderResult.error)
          }
        } else {
          setStatus('failed')
          setMessage('Payment verification failed or was not successful')
        }

      } catch (error) {
        console.error('Payment callback error:', error)
        setStatus('failed')
        setMessage('An error occurred while processing your payment')
      }
    }

    handlePaymentCallback()
  }, [searchParams])

  return (
    <div className="pt-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        className="text-center bg-white rounded-2xl shadow-lg p-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {status === 'loading' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <Loader className="h-16 w-16 text-blue-600 mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Processing Payment...</h1>
            <p className="text-gray-600">Please wait while we verify your payment.</p>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-xl text-gray-600 mb-2">{message}</p>
            {orderId && (
              <p className="text-gray-600 mb-8">
                Order ID: <span className="font-semibold text-green-600">#{orderId}</span>
              </p>
            )}
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
              <p className="text-green-800">
                📧 A confirmation email has been sent to your email address
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
        )}

        {status === 'failed' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
            <p className="text-xl text-gray-600 mb-8">{message}</p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <p className="text-red-800">
                Your payment could not be processed. Please try again or contact support.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/checkout">
                <motion.button
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Try Again
                </motion.button>
              </Link>
              <Link href="/products">
                <motion.button
                  className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Continue Shopping
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default function PaymentCallback() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Suspense fallback={
        <div className="pt-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center bg-white rounded-2xl shadow-lg p-8">
            <Loader className="h-16 w-16 text-blue-600 mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading Payment Status...</h1>
            <p className="text-gray-600">Please wait while we load your payment information.</p>
          </div>
        </div>
      }>
        <PaymentCallbackContent />
      </Suspense>
    </div>
  )
} 