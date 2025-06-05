import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      amount, 
      currency = 'RWF', 
      email, 
      phone_number, 
      name, 
      tx_ref,
      redirect_url 
    } = body

    // Validate required fields
    if (!amount || !email || !name || !tx_ref) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: amount, email, name, tx_ref'
      }, { status: 400 })
    }

    // Check environment variables
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY
    if (!secretKey) {
      console.error('Missing Flutterwave secret key')
      return NextResponse.json({
        success: false,
        error: 'Payment service not configured'
      }, { status: 500 })
    }

    console.log('Creating payment with secret key:', secretKey.substring(0, 20) + '...')

    // Use Flutterwave Standard Payment flow
    const payload = {
      tx_ref: tx_ref,
      amount: amount,
      currency: currency,
      redirect_url: redirect_url || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/callback`,
      payment_options: "card,mobilemoney,ussd",
      meta: {
        consumer_id: tx_ref,
        consumer_mac: "92a3-912ba-1192a"
      },
      customer: {
        email: email,
        phonenumber: phone_number || '',
        name: name
      },
      customizations: {
        title: "Greenhouse Fresh Vegetables",
        description: `Payment for fresh vegetables - Order #${tx_ref}`,
        logo: "https://assets.piedpiper.com/logo.png"
      }
    }

    try {
      console.log('Initiating Flutterwave payment with payload:', JSON.stringify(payload, null, 2))
      
      // Use direct HTTP request to Flutterwave API
      const response = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      console.log('Flutterwave response:', JSON.stringify(result, null, 2))
      
      if (result.status === 'success') {
        return NextResponse.json({
          success: true,
          data: {
            link: result.data.link,
            tx_ref: tx_ref,
            amount: amount,
            currency: currency
          },
          message: 'Payment link generated successfully'
        })
      } else {
        console.error('Flutterwave error response:', result)
        return NextResponse.json({
          success: false,
          error: result.message || 'Payment initiation failed',
          data: result
        }, { status: 400 })
      }
    } catch (paymentError: any) {
      console.error('Flutterwave payment error:', paymentError)
      return NextResponse.json({
        success: false,
        error: 'Payment processing failed',
        details: paymentError.message || paymentError.toString()
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Payment API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transaction_id = searchParams.get('transaction_id')
    const tx_ref = searchParams.get('tx_ref')

    if (!transaction_id && !tx_ref) {
      return NextResponse.json({
        success: false,
        error: 'Missing transaction_id or tx_ref parameter'
      }, { status: 400 })
    }

    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({
        success: false,
        error: 'Payment service not configured'
      }, { status: 500 })
    }

    try {
      let url = 'https://api.flutterwave.com/v3/transactions'
      if (transaction_id) {
        url += `/${transaction_id}/verify`
      } else if (tx_ref) {
        url += `/verify_by_reference?tx_ref=${tx_ref}`
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (result.status === 'success') {
        return NextResponse.json({
          success: true,
          data: result.data,
          message: 'Transaction verified successfully'
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'Transaction verification failed',
          data: result
        }, { status: 400 })
      }
    } catch (verifyError: any) {
      console.error('Transaction verification error:', verifyError)
      return NextResponse.json({
        success: false,
        error: 'Transaction verification failed',
        details: verifyError.message
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Payment verification API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
} 