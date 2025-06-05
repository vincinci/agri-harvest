import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    // In production, you would:
    // 1. Save to database
    // 2. Send email notification to admin
    // 3. Send auto-reply email to customer
    
    // For now, just log the contact attempt
    console.log('Contact form submission:', {
      name,
      email,
      phone,
      subject,
      message,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Thank you for your message! We will get back to you soon.'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
} 