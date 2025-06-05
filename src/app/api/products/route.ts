import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    
    // Build filter conditions
    const where: any = {}
    
    if (category && category !== 'all') {
      where.category = category
    }
    
    if (search) {
      // Split search into individual words and create flexible search
      const searchTerms = search.toLowerCase()
        .split(/\s+/) // Split by whitespace
        .filter(term => term.length > 0) // Remove empty strings
        .map(term => term.trim()) // Trim each term
      
      if (searchTerms.length > 0) {
        // Create OR conditions for each search term across multiple fields
        const searchConditions = searchTerms.flatMap(term => [
          { name: { contains: term } },
          { description: { contains: term } },
          { category: { contains: term } }
        ])
        
        where.OR = searchConditions
      }
    }
    
    // Get products
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    
    // Get categories
    const categoryResult = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category']
    })
    const categories = categoryResult.map(p => p.category)
    
    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
      currency: "RWF",
      categories,
      searchTerms: search ? search.toLowerCase().split(/\s+/).filter(term => term.length > 0) : [],
      message: products.length === 0 ? 'No products found matching your criteria' : undefined
    })
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { name, description, price, category, color, quantity } = body
    
    if (!name || !description || !price || !category || !color || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, description, price, category, color, quantity' },
        { status: 400 }
      )
    }
    
    // Create new product
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        image: body.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9L2K4M7P1T5X8W3F6C9E2Y4Z8Q1A6Dx3w9&s",
        category,
        color,
        quantity: Number(quantity),
        inStock: Number(quantity) > 0
      }
    })
    
    return NextResponse.json(
      { 
        success: true, 
        data: newProduct,
        message: 'Product created successfully'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create product error:', error)
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'A product with this name already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    )
  }
} 