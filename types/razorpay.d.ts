// Razorpay TypeScript definitions
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  image?: string;
  handler: (response: RazorpaySuccessResponse) => void;
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

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayErrorResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: Record<string, any>;
  };
}

interface RazorpayInstance {
  open(): void;
  close(): void;
  on(event: string, handler: Function): void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export {
  RazorpayOptions,
  RazorpaySuccessResponse,
  RazorpayErrorResponse,
  RazorpayInstance,
};
