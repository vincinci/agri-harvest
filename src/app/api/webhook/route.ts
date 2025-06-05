import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'
import crypto from 'crypto'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('verif-hash')
    
    // Verify webhook signature (optional but recommended)
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET
    if (secretHash && signature !== secretHash) {
      console.log('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse the webhook payload
    const event = JSON.parse(body)
    
    console.log('Webhook received:', {
      event: event.event,
      txRef: event.data?.tx_ref,
      status: event.data?.status
    })

    // Handle different event types
    switch (event.event) {
      case 'charge.completed':
        await handlePaymentCompleted(event.data)
        break
      
      case 'transfer.completed':
        await handleTransferCompleted(event.data)
        break
        
      default:
        console.log('Unhandled event type:', event.event)
    }

    return NextResponse.json({ status: 'success' })

  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentCompleted(data: any) {
  try {
    const { tx_ref, status, amount, currency, customer } = data

    if (status === 'successful') {
      // Find pending order by tx_ref
      const order = await prisma.order.findFirst({
        where: { 
          paymentRef: tx_ref,
          paymentStatus: 'PENDING'
        }
      })

      if (order) {
        // Update order status to completed
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'COMPLETED',
            updatedAt: new Date()
          }
        })

        // Clear cart items for this customer email
        const cart = await prisma.cart.findFirst({
          where: { userId: customer?.email || 'unknown' }
        })

        if (cart) {
          await prisma.cartItem.deleteMany({
            where: { cartId: cart.id }
          })
        }

        console.log(`Order ${order.id} payment completed successfully`)
        
        // Here you could also:
        // - Send confirmation email to customer
        // - Trigger inventory updates
        // - Send SMS notification
        // - Update analytics
        
      } else {
        console.log(`No pending order found for tx_ref: ${tx_ref}`)
      }
    } else {
      // Handle failed payments
      const order = await prisma.order.findFirst({
        where: { 
          paymentRef: tx_ref,
          paymentStatus: 'PENDING'
        }
      })

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'FAILED',
            updatedAt: new Date()
          }
        })

        console.log(`Order ${order.id} payment failed`)
      }
    }

  } catch (error) {
    console.error('Error handling payment completion:', error)
    throw error
  }
}

async function handleTransferCompleted(data: any) {
  try {
    const { reference, status, amount, currency } = data
    
    console.log('Transfer completed:', {
      reference,
      status,
      amount,
      currency
    })

    // Handle transfer completion logic here
    // This could be for payouts to vendors, refunds, etc.
    
  } catch (error) {
    console.error('Error handling transfer completion:', error)
    throw error
  }
} 