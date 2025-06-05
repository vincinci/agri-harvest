const { PrismaClient } = require('./src/generated/prisma')

const prisma = new PrismaClient()

async function testPrisma() {
  try {
    console.log('Testing Prisma connection...')
    
    const count = await prisma.product.count()
    console.log(`✅ Database connected! Found ${count} products`)
    
    const products = await prisma.product.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        price: true
      }
    })
    
    console.log('Sample products:')
    products.forEach(p => console.log(`- ${p.name}: ${p.price} RWF`))
    
  } catch (error) {
    console.error('❌ Prisma error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testPrisma() 