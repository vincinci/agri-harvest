import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const customerEmail = searchParams.get('customerEmail')
    const status = searchParams.get('status')
    
    const where: any = {}
    
    if (customerEmail) {
      where.customerEmail = customerEmail
    }
    
    if (status) {
      where.status = status
    }
    
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length
    })
  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      customerAddress, 
      customerNotes, 
      sessionId = 'default',
      paymentRef,
      paymentAmount,
      paymentStatus = 'PENDING'
    } = body
    
    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: customerName, customerEmail' },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    // Get cart for session
    const cart = await prisma.cart.findFirst({
      where: { userId: sessionId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })
    
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      )
    }
    
    // Calculate total amount
    const subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    const deliveryFee = subtotal > 10000 ? 0 : 2000
    const totalAmount = subtotal + deliveryFee
    
    // Validate payment amount if provided
    if (paymentAmount && Math.abs(paymentAmount - totalAmount) > 1) {
      return NextResponse.json(
        { success: false, error: 'Payment amount does not match order total' },
        { status: 400 }
      )
    }
    
    // Create order
    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        customerAddress: customerAddress || null,
        customerNotes: customerNotes || null,
        totalAmount,
        status: paymentStatus === 'completed' ? 'CONFIRMED' : 'PENDING',
        paymentRef: paymentRef || null,
        paymentStatus: paymentStatus || 'PENDING',
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })
    
    // Clear the cart after successful order
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    })
    
    return NextResponse.json(
      {
        success: true,
        data: order,
        message: 'Order created successfully'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Orders POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { orderId, status } = body
    
    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: orderId, status' },
        { status: 400 }
      )
    }
    
    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Valid statuses: ' + validStatuses.join(', ') },
        { status: 400 }
      )
    }
    
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: `Order status updated to ${status}`
    })
  } catch (error) {
    console.error('Orders PUT error:', error)
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    )
  }
} 