declare module 'flutterwave-node-v3' {
  interface FlutterwaveResponse {
    status: string
    message?: string
    data?: any
  }

  interface PaymentPayload {
    card_number?: string
    cvv?: string
    expiry_month?: string
    expiry_year?: string
    currency: string
    amount: number
    redirect_url?: string
    fullname?: string
    email?: string
    phone_number?: string
    enckey?: string
    tx_ref: string
    payment_options?: string
    meta?: any
    customer?: any
    customizations?: any
  }

  interface StandardPaymentPayload {
    tx_ref: string
    amount: number
    currency: string
    redirect_url?: string
    payment_options?: string
    meta?: any
    customer?: {
      email: string
      phonenumber?: string
      name: string
    }
    customizations?: {
      title?: string
      description?: string
      logo?: string
    }
  }

  interface VerifyPayload {
    id?: string
    tx_ref?: string
  }

  class Flutterwave {
    constructor(publicKey: string, secretKey: string)
    Charge: {
      card(payload: PaymentPayload): Promise<FlutterwaveResponse>
    }
    Transaction: {
      verify(payload: VerifyPayload): Promise<FlutterwaveResponse>
    }
    Payment: {
      create(payload: StandardPaymentPayload): Promise<FlutterwaveResponse>
    }
  }

  export default Flutterwave
} 