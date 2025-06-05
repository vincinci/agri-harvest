import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const count = await prisma.product.count()
    return NextResponse.json({
      success: true,
      message: 'API is working!',
      productCount: count
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 