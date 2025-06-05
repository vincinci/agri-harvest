import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()

  // Create fresh vegetables and fruits with Google Images
  const products = [
    // Vegetables
    {
      id: 1,
      name: "Tomatoes",
      description: "Fresh, juicy tomatoes perfect for cooking and salads",
      price: 3500,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKxZ5k8fO4F7mYWF2w5C9r3A6B8X8Q8Y1eXw&s",
      category: "vegetables",
      color: "red",
      quantity: 50,
      inStock: true
    },
    {
      id: 2,
      name: "Green Bell Peppers",
      description: "Crisp green bell peppers, perfect for cooking and stir-fries",
      price: 4000,
      image: "https://www.lipmanfamilyfarms.com/wp-content/uploads/2020/09/Green-Bell-Pepper-hero@2x.png",
      category: "vegetables",
      color: "green",
      quantity: 40,
      inStock: true
    },
    {
      id: 3,
      name: "Yellow Bell Peppers",
      description: "Sweet yellow bell peppers, great for salads and roasting",
      price: 4500,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2H8K5L3M7P1T6X4W9F2C5E8Y3Z6Q1A4Dx7w&s",
      category: "vegetables",
      color: "yellow",
      quantity: 35,
      inStock: true
    },
    {
      id: 4,
      name: "Red Bell Peppers",
      description: "Sweet red bell peppers, perfect for grilling and cooking",
      price: 5000,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8K2L6M4P9T3X7W1F5C9E1Y6Z8Q2A7Dx4w5&s",
      category: "vegetables",
      color: "red",
      quantity: 30,
      inStock: true
    },
    {
      id: 5,
      name: "Cucumbers",
      description: "Fresh, crisp cucumbers perfect for salads and snacking",
      price: 3500,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4L7K1M8P5T2X9W3F6C4E7Y1Z5Q8A3Dx6w9&s",
      category: "vegetables",
      color: "green",
      quantity: 45,
      inStock: true
    },
    {
      id: 6,
      name: "English Peas",
      description: "Sweet English peas, excellent for cooking and side dishes",
      price: 6500,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9P5S8K2L7M4T1X6W3F8C2E9Y5Z7Q4A1Dx3w&s",
      category: "vegetables",
      color: "green",
      quantity: 25,
      inStock: true
    },
    {
      id: 7,
      name: "French Beans",
      description: "Tender green French beans, excellent source of vitamins",
      price: 5500,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7N4K1L8M3P6T2X9W5F1C7E4Y8Z2Q9A3Dx5w&s",
      category: "vegetables",
      color: "green",
      quantity: 35,
      inStock: true
    },
    {
      id: 8,
      name: "Carrots",
      description: "Sweet, crunchy carrots rich in beta-carotene",
      price: 4500,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5N8s7K4L2M9pTvX6W1F8C3E7Y5Z2Q9A1Dx8&s",
      category: "vegetables",
      color: "orange",
      quantity: 45,
      inStock: true
    },
    {
      id: 9,
      name: "Onions",
      description: "Fresh onions, essential for cooking and flavoring dishes",
      price: 3000,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8M5V4J7K1P9S6X2W8F3C9E5Y7Z1Q3A8Dx4w&s",
      category: "vegetables",
      color: "white",
      quantity: 60,
      inStock: true
    },
    {
      id: 10,
      name: "Chilli Peppers",
      description: "Spicy chilli peppers to add heat to your dishes",
      price: 8000,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1P7K9L2M6S4X8W1F5C3E7Y2Z9Q4A8Dx1w6&s",
      category: "vegetables",
      color: "red",
      quantity: 25,
      inStock: true
    },
    {
      id: 11,
      name: "Baby Corn",
      description: "Tender baby corn, perfect for stir-fries and salads",
      price: 6000,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8K3L5M2P7T1X4W6F9C1E5Y8Z3Q2A7Dx5w4&s",
      category: "vegetables",
      color: "yellow",
      quantity: 30,
      inStock: true
    },
    {
      id: 12,
      name: "Broccoli",
      description: "Nutritious green broccoli, packed with vitamins and minerals",
      price: 7000,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9M4K8L1P6T3X7W2F5C8E1Y4Z6Q9A4Dx7w2&s",
      category: "vegetables",
      color: "green",
      quantity: 25,
      inStock: true
    },
    {
      id: 13,
      name: "Cabbages",
      description: "Fresh green cabbages, great for salads and cooking",
      price: 2500,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7Vv8rJ5m4D8pCxKs9T2A6X5Y8P1S7E3Uw7Q&s",
      category: "vegetables",
      color: "green",
      quantity: 40,
      inStock: true
    },
    {
      id: 14,
      name: "Okra",
      description: "Fresh okra pods, traditional vegetable rich in fiber",
      price: 4500,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5L2K9M6P4T8X1W3F7C4E9Y1Z5Q8A3Dx6w7&s",
      category: "vegetables",
      color: "green",
      quantity: 35,
      inStock: true
    },
    {
      id: 15,
      name: "Eggplant",
      description: "Purple eggplants, versatile vegetable for many dishes",
      price: 3500,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQK5R8p8rGLjmE-xpKv8N8rj9G8RfQ7EqY5w&s",
      category: "vegetables",
      color: "purple",
      quantity: 30,
      inStock: true
    },
    {
      id: 16,
      name: "Mushroom",
      description: "Fresh mushrooms, excellent source of protein and nutrients",
      price: 9000,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7P3K1L9M5T2X6W8F4C2E6Y7Z1Q5A9Dx3w8&s",
      category: "vegetables",
      color: "brown",
      quantity: 20,
      inStock: true
    },
    {
      id: 17,
      name: "Hot Peppers",
      description: "Extra spicy hot peppers for those who love intense heat",
      price: 10000,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6N8K4L7M1P9T5X2W6F8C3E5Y9Z4Q7A1Dx2w&s",
      category: "vegetables",
      color: "red",
      quantity: 20,
      inStock: true
    },
    // Fruits
    {
      id: 18,
      name: "Avocados",
      description: "Creamy avocados, rich in healthy fats and nutrients",
      price: 6000,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9P1K7L8M4T2X9W6F3C7E4Y9Z2Q6A3Dx1w8&s",
      category: "fruits",
      color: "green",
      quantity: 40,
      inStock: true
    },
    {
      id: 19,
      name: "Mangoes",
      description: "Sweet, tropical mangoes at perfect ripeness",
      price: 8000,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4K2L6M8P1T7X3W5F9C6E2Y4Z8Q3A6Dx9w1&s",
      category: "fruits",
      color: "yellow",
      quantity: 35,
      inStock: true
    },
    {
      id: 20,
      name: "Pineapples",
      description: "Fresh, juicy pineapples with tropical sweetness",
      price: 7500,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1M7K2L5P8T3X6W4F9C2E5Y8Z1Q7A5Dx8w2&s",
      category: "fruits",
      color: "yellow",
      quantity: 25,
      inStock: true
    },
    {
      id: 21,
      name: "Passion Fruit",
      description: "Aromatic passion fruits with intense tropical flavor",
      price: 9000,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6N3K8L4M9P1T5X7W2F6C4E9Y1Z5Q8A4Dx3w&s",
      category: "fruits",
      color: "purple",
      quantity: 30,
      inStock: true
    },
    {
      id: 22,
      name: "Bananas",
      description: "Sweet, ripe bananas perfect for snacking or cooking",
      price: 3000,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8K5L3M7P2T6X4W9F1C5E8Y3Z6Q9A2Dx7w1&s",
      category: "fruits",
      color: "yellow",
      quantity: 60,
      inStock: true
    },
    {
      id: 23,
      name: "Strawberries",
      description: "Fresh, sweet strawberries packed with vitamin C",
      price: 12000,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2H7K4L1M8P5T9X3W7F1C9E6Y2Z8Q4A7Dx1w&s",
      category: "fruits",
      color: "red",
      quantity: 15,
      inStock: true
    }
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product
    })
    console.log(`Created product: ${product.name}`)
  }
  
  console.log('Database seeded successfully with fresh vegetables and fruits!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 