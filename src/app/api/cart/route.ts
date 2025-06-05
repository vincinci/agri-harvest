import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'

// Configure Prisma with better connection handling for Neon
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['error'],
})

// Simple in-memory rate limiting for add-to-cart requests
const addToCartRequests = new Map<string, { lastRequest: number, count: number }>()
const RATE_LIMIT_WINDOW = 2000 // 2 seconds
const MAX_REQUESTS_PER_WINDOW = 1 // Only 1 add request per window

// Cleanup function for graceful shutdown
async function cleanup() {
  try {
    await prisma.$disconnect()
    console.log('Database disconnected gracefully')
  } catch (error) {
    console.error('Error during cleanup:', error)
  }
}

// Handle process termination
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

// Enhanced cart item interface
interface CartItem {
  id: string
  productId: number
  quantity: number
  price: number
  name: string
  image: string
}

// Rate limiting helper function
function checkRateLimit(sessionId: string, productId: number): boolean {
  const key = `${sessionId}:${productId}`
  const now = Date.now()
  
  // Clean up old entries
  for (const [k, v] of addToCartRequests.entries()) {
    if (now - v.lastRequest > RATE_LIMIT_WINDOW) {
      addToCartRequests.delete(k)
    }
  }
  
  const existing = addToCartRequests.get(key)
  
  if (!existing) {
    // First request for this session/product
    addToCartRequests.set(key, { lastRequest: now, count: 1 })
    return true
  }
  
  if (now - existing.lastRequest < RATE_LIMIT_WINDOW) {
    // Within rate limit window
    if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
      console.log(`Rate limit exceeded for ${key}`)
      return false
    }
    
    existing.count++
    existing.lastRequest = now
    return true
  } else {
    // Outside rate limit window, reset
    addToCartRequests.set(key, { lastRequest: now, count: 1 })
    return true
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId') || 'default'
    
    console.log(`Fetching cart for session: ${sessionId}`)
    
    // Single optimized query with all needed data
    const cartData = await prisma.cart.findFirst({
      where: { userId: sessionId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true
              }
            }
          }
        }
      }
    })
    
    let items: any[] = []
    let itemsCount = 0
    let subtotal = 0
    
    if (cartData && cartData.items.length > 0) {
      items = cartData.items.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
        name: item.product.name,
        image: item.product.image
      }))
      
      // Calculate totals in JavaScript instead of separate DB queries
      itemsCount = cartData.items.reduce((sum, item) => sum + item.quantity, 0)
      subtotal = cartData.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    }
    
    const deliveryFee = 2000
    const total = subtotal + deliveryFee
    
    console.log(`Cart fetched successfully: ${itemsCount} items, ${subtotal} RWF`)
    
    return NextResponse.json({
      success: true,
      data: {
        items,
        summary: {
          itemsCount,
          subtotal,
          deliveryFee,
          total,
          currency: "RWF",
          message: "Delivery fee: 2,000 RWF"
        }
      }
    })
  } catch (error) {
    console.error('Cart GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sessionId = 'default', productId, quantity = 1 } = body
    
    console.log(`Adding to cart: session=${sessionId}, product=${productId}, quantity=${quantity}`)
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    // Validate quantity
    if (quantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be greater than 0' },
        { status: 400 }
      )
    }
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    })
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }
    
    // Check rate limit
    if (!checkRateLimit(sessionId, parseInt(productId))) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
    
    // Simplified transaction with better error handling
    const result = await prisma.$transaction(async (tx) => {
      // Find or create cart
      let cart = await tx.cart.findFirst({
        where: { userId: sessionId }
      });
      
      if (!cart) {
        cart = await tx.cart.create({
          data: { userId: sessionId }
        });
      }
      
      // Check if item already exists in cart
      const existingItem = await tx.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: parseInt(productId)
          }
        }
      });
      
      if (existingItem) {
        // Update existing item
        return await tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
          include: { product: true }
        });
      } else {
        // Create new item
        return await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId: parseInt(productId),
            quantity: quantity
          },
          include: { product: true }
        });
      }
    }, {
      timeout: 5000, // 5 second timeout
    });
    
    console.log(`Item added to cart successfully: ${result.product.name}`)
    
    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        quantity: result.quantity,
        product: {
          id: result.product.id,
          name: result.product.name,
          price: result.product.price,
          image: result.product.image
        }
      },
      message: 'Item added to cart successfully'
    })
    
  } catch (error) {
    console.error('Cart POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add item to cart', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { itemId, quantity } = body
    
    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: itemId, quantity' },
        { status: 400 }
      )
    }

    if (isNaN(Number(quantity))) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be a valid number' },
        { status: 400 }
      )
    }

    if (Number(quantity) <= 0) {
      // Remove item if quantity is 0 or negative - check if exists first
      const existingItem = await prisma.cartItem.findUnique({
        where: { id: itemId }
      })
      
      if (existingItem) {
        await prisma.cartItem.delete({
          where: { id: itemId }
        })
        return NextResponse.json(
          { success: true, message: 'Item removed from cart' }
        )
      } else {
        return NextResponse.json(
          { success: true, message: 'Item was already removed from cart' }
        )
      }
    } else {
      // Update quantity - use updateMany to avoid errors if item doesn't exist
      const updateResult = await prisma.cartItem.updateMany({
        where: { id: itemId },
        data: { quantity: Number(quantity) }
      })
      
      if (updateResult.count === 0) {
        return NextResponse.json(
          { success: false, error: 'Cart item not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { success: true, message: 'Cart updated successfully' }
      )
    }
  } catch (error) {
    console.error('Cart PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update cart' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    let itemId = searchParams.get('itemId')
    let sessionId = searchParams.get('sessionId')
    
    // If itemId not in URL params, try to get it from request body
    if (!itemId) {
      try {
        const body = await request.json()
        itemId = body.itemId
        sessionId = sessionId || body.sessionId
      } catch (error) {
        // Body parsing failed, continue with URL params only
      }
    }

    if (itemId) {
      // Remove specific item - use deleteMany to avoid "record not found" errors
      const deleteResult = await prisma.cartItem.deleteMany({
        where: { id: itemId }
      })
      
      if (deleteResult.count > 0) {
        return NextResponse.json(
          { success: true, message: 'Item removed from cart successfully' }
        )
      } else {
        return NextResponse.json(
          { success: true, message: 'Item was already removed from cart' }
        )
      }
    } else if (sessionId) {
      // Clear entire cart for session - optimized with deleteMany
      const cart = await prisma.cart.findFirst({
        where: { userId: sessionId },
        select: { id: true }
      })
      
      if (cart) {
        const deletedItems = await prisma.cartItem.deleteMany({
          where: { cartId: cart.id }
        })
        
        return NextResponse.json(
          { 
            success: true, 
            message: `Cart cleared successfully. ${deletedItems.count} items removed.`
          }
        )
      } else {
        return NextResponse.json(
          { success: true, message: 'Cart was already empty' }
        )
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Missing itemId or sessionId parameter' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Cart DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove item from cart' },
      { status: 500 }
    )
  }
}