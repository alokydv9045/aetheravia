import crypto from 'crypto';

const base = process.env.RAZORPAY_API_URL || 'https://api.razorpay.com/v1';

interface RazorpayOrderOptions {
  amount: number;
  currency?: string;
  receipt?: string;
  payment_capture?: number;
  notes?: Record<string, string>;
}

interface RazorpayPaymentOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  image?: string;
  handler: (response: any) => void;
  modal?: {
    ondismiss?: () => void;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  method?: {
    upi?: boolean;
    card?: boolean;
    netbanking?: boolean;
    wallet?: boolean;
  };
}

export const razorpay = {
  createOrder: async function createOrder(
    amount: number, 
    options: Partial<RazorpayOrderOptions> = {}
  ) {
    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
    

    
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured');
    }
    
    const auth = Buffer.from(RAZORPAY_KEY_ID + ':' + RAZORPAY_KEY_SECRET).toString('base64');
    
    const orderData = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: options.currency || 'INR',
      receipt: options.receipt || `order_${Date.now()}`,
      payment_capture: options.payment_capture ?? 1,
      notes: options.notes || {},
    };


    
    const url = `${base}/orders`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(orderData),
    });


    
    return handleResponse(response);
  },
  
  initializePayment: function initializePayment(options: RazorpayPaymentOptions) {
    if (typeof window === 'undefined' || !window.Razorpay) {
      throw new Error('Razorpay script not loaded');
    }
    
    const rzp = new window.Razorpay(options);
    rzp.open();
    return rzp;
  },
  
  getPaymentMethods: function getPaymentMethods(paymentType: string) {
    const methods: Record<string, any> = {
      razorpay_upi: {
        upi: true,
        card: false,
        netbanking: false,
        wallet: false,
      },
      razorpay_card: {
        upi: false,
        card: true,
        netbanking: false,
        wallet: false,
      },
      razorpay_netbanking: {
        upi: false,
        card: false,
        netbanking: true,
        wallet: false,
      },
      razorpay_wallet: {
        upi: false,
        card: false,
        netbanking: false,
        wallet: true,
      },
    };
    
    return methods[paymentType] || {
      upi: true,
      card: true,
      netbanking: true,
      wallet: true,
    };
  },
  
  verifyPayment: async function verifyPayment(
    paymentId: string, 
    orderId: string, 
    signature: string
  ) {
    const { RAZORPAY_KEY_SECRET } = process.env;
    
    if (!RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay secret not configured');
    }
    
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
      
    return expectedSignature === signature;
  },
  
  capturePayment: async function capturePayment(paymentId: string, amount: number) {
    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
    
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured');
    }
    
    const auth = Buffer.from(RAZORPAY_KEY_ID + ':' + RAZORPAY_KEY_SECRET).toString('base64');
    
    const url = `${base}/payments/${paymentId}/capture`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Amount in paise
      }),
    });
    
    return handleResponse(response);
  },
  getPaymentDetails: async function getPaymentDetails(paymentId: string) {
    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
    
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured');
    }
    
    const auth = Buffer.from(RAZORPAY_KEY_ID + ':' + RAZORPAY_KEY_SECRET).toString('base64');
    
    const url = `${base}/payments/${paymentId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    
    return handleResponse(response);
  },
  
  createRefund: async function createRefund(paymentId: string, amount?: number) {
    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
    
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured');
    }
    
    const auth = Buffer.from(RAZORPAY_KEY_ID + ':' + RAZORPAY_KEY_SECRET).toString('base64');
    
    const url = `${base}/payments/${paymentId}/refund`;
    const refundData: any = {};
    if (amount) {
      refundData.amount = Math.round(amount * 100); // Amount in paise
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(refundData),
    });
    
    return handleResponse(response);
  }
};

async function handleResponse(response: any) {

  
  if (response.status === 200 || response.status === 201) {
    const data = await response.json();

    return data;
  }

  const errorMessage = await response.text();
  console.error('[RAZORPAY ERROR] API Error:', {
    status: response.status,
    statusText: response.statusText,
    errorMessage
  });
  throw new Error(errorMessage);
}
