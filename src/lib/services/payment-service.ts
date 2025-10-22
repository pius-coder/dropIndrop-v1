import { retry, sleep } from "../utils";

// Types for payment operations
export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
  metadata: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: string;
  requiresAction?: boolean;
  redirectUrl?: string;
}

export interface PaymentVerification {
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  metadata: Record<string, any>;
}

export interface PaymentProvider {
  createPaymentIntent(
    amount: number,
    orderId: string,
    customerInfo: { name?: string; email?: string; phone?: string },
    shopName?: string
  ): Promise<PaymentResult>;

  verifyPaymentIntent(
    paymentIntentId: string
  ): Promise<PaymentVerification | null>;

  confirmPaymentIntent(paymentIntentId: string): Promise<PaymentResult>;

  cancelPaymentIntent(
    paymentIntentId: string
  ): Promise<{ success: boolean; error?: string }>;

  createPaymentLink(
    amount: number,
    productName: string,
    orderId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ success: boolean; url?: string; error?: string }>;

  handleWebhookEvent(
    payload: string | Buffer,
    signature: string
  ): Promise<{ success: boolean; error?: string }>;
}

// Lygos-specific interfaces
export interface LygosGatewayRequest {
  amount: number;
  currency: string;
  order_id: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  shop_name?: string;
  success_url: string;
  cancel_url: string;
}

export interface LygosGatewayResponse {
  gateway_url: string;
  order_id: string;
  status: string;
  expires_at: string;
}

export interface LygosPaymentStatus {
  order_id: string;
  status: "pending" | "paid" | "failed" | "cancelled" | "expired";
  amount: number;
  currency: string;
  paid_at?: string;
  transaction_id?: string;
}

export interface PaymentServiceConfig {
  currency: string;
  maxRetries: number;
  retryDelay: number;
}

/**
 * Lygos payment provider implementation
 * Integrates with Lygos payment gateway API for redirect-based payments
 */
class LygosPaymentProvider implements PaymentProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = "https://api.lygos.com/v1") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async createPaymentIntent(
    amount: number,
    orderId: string,
    customerInfo: { name?: string; email?: string; phone?: string },
    shopName?: string
  ): Promise<PaymentResult> {
    try {
      const request: LygosGatewayRequest = {
        amount,
        currency: "XAF",
        order_id: orderId,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        shop_name: shopName || "DropInDrop",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?order_id=${orderId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel?order_id=${orderId}`,
      };

      const response = await fetch(`${this.baseUrl}/gateway`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(
          `Lygos API error: ${response.status} ${response.statusText}`
        );
      }

      const data: LygosGatewayResponse = await response.json();

      return {
        success: true,
        redirectUrl: data.gateway_url,
        paymentIntent: {
          id: data.order_id,
          client_secret: `lygos_${data.order_id}`,
          amount,
          currency: "XAF",
          status: "requires_payment_method",
          metadata: {
            orderId,
            gatewayUrl: data.gateway_url,
            expiresAt: data.expires_at,
          },
        },
      };
    } catch (error) {
      console.error("Lygos createPaymentIntent error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create Lygos payment gateway",
      };
    }
  }

  async verifyPaymentIntent(
    paymentIntentId: string
  ): Promise<PaymentVerification | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/gateway/payin/${paymentIntentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Payment not found
        }
        throw new Error(
          `Lygos API error: ${response.status} ${response.statusText}`
        );
      }

      const data: LygosPaymentStatus = await response.json();

      return {
        paymentIntentId: data.order_id,
        amount: data.amount,
        currency: data.currency,
        status: data.status === "paid" ? "succeeded" : data.status,
        metadata: {
          transactionId: data.transaction_id,
          paidAt: data.paid_at,
        },
      };
    } catch (error) {
      console.error("Lygos verifyPaymentIntent error:", error);
      return null;
    }
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<PaymentResult> {
    // For Lygos, confirmation happens via status checking
    // This method can be used to poll for status updates
    const verification = await this.verifyPaymentIntent(paymentIntentId);

    if (!verification) {
      return {
        success: false,
        error: "Payment intent not found",
      };
    }

    return {
      success: verification.status === "succeeded",
      paymentIntent: {
        id: verification.paymentIntentId,
        client_secret: `lygos_${verification.paymentIntentId}`,
        amount: verification.amount,
        currency: verification.currency,
        status: verification.status,
        metadata: verification.metadata,
      },
    };
  }

  async cancelPaymentIntent(
    paymentIntentId: string
  ): Promise<{ success: boolean; error?: string }> {
    // Lygos doesn't have explicit cancel endpoint, but we can mark as cancelled
    // This would typically be handled on our side
    return { success: true };
  }

  async createPaymentLink(
    amount: number,
    productName: string,
    orderId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    // For Lygos, payment links are created via gateway
    const result = await this.createPaymentIntent(amount, orderId, {});
    if (result.success && result.redirectUrl) {
      return {
        success: true,
        url: result.redirectUrl,
      };
    }
    return {
      success: false,
      error: result.error,
    };
  }

  async handleWebhookEvent(
    payload: string | Buffer,
    signature: string
  ): Promise<{ success: boolean; error?: string }> {
    // Lygos doesn't mention webhooks in the analysis, so this is a no-op
    // Could be implemented if webhooks are added later
    return { success: true };
  }
}

/**
 * Mock payment provider for development and testing
 * Can be easily replaced with real payment providers (MTN MoMo, Orange Money, etc.)
 */
class MockPaymentProvider implements PaymentProvider {
  async createPaymentIntent(
    amount: number,
    orderId: string,
    customerInfo: { name?: string; email?: string; phone?: string },
    shopName?: string
  ): Promise<PaymentResult> {
    // Simulate API delay
    await sleep(500);

    // Mock successful payment intent creation
    const paymentIntent: PaymentIntent = {
      id: `pi_mock_${Date.now()}`,
      client_secret: `pi_mock_${Date.now()}_secret`,
      amount,
      currency: "XAF",
      status: "requires_payment_method",
      metadata: {
        orderId,
        customerName: customerInfo.name || "",
        customerEmail: customerInfo.email || "",
        customerPhone: customerInfo.phone || "",
      },
    };

    // Mock redirect URL for testing
    const redirectUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/payment/mock?payment_intent=${paymentIntent.id}`;

    return {
      success: true,
      paymentIntent,
      redirectUrl,
    };
  }

  async verifyPaymentIntent(
    paymentIntentId: string
  ): Promise<PaymentVerification | null> {
    // Simulate API delay
    await sleep(300);

    return {
      paymentIntentId,
      amount: 1000,
      currency: "XAF",
      status: "succeeded",
      metadata: { orderId: "mock-order" },
    };
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<PaymentResult> {
    // Simulate API delay
    await sleep(500);

    return {
      success: true,
      paymentIntent: {
        id: paymentIntentId,
        client_secret: `${paymentIntentId}_secret`,
        amount: 1000,
        currency: "XAF",
        status: "succeeded",
        metadata: { orderId: "mock-order" },
      },
    };
  }

  async cancelPaymentIntent(
    paymentIntentId: string
  ): Promise<{ success: boolean; error?: string }> {
    await sleep(200);
    return { success: true };
  }

  async createPaymentLink(
    amount: number,
    productName: string,
    orderId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    await sleep(300);

    // Mock payment link URL
    const mockUrl = `${successUrl}?payment_intent=mock_${Date.now()}&payment_status=success`;

    return {
      success: true,
      url: mockUrl,
    };
  }

  async handleWebhookEvent(
    payload: string | Buffer,
    signature: string
  ): Promise<{ success: boolean; error?: string }> {
    await sleep(100);
    return { success: true };
  }
}

/**
 * Payment service adapter for DropInDrop platform
 * Provides a unified interface for payment processing that can be easily swapped
 * between different payment providers (Mock, MTN MoMo, Orange Money, etc.)
 */
export class PaymentService {
  private provider: PaymentProvider;
  private config: PaymentServiceConfig;

  constructor(
    provider?: PaymentProvider,
    config?: Partial<PaymentServiceConfig>
  ) {
    // Use mock provider by default for development
    this.provider = provider || new MockPaymentProvider();
    this.config = {
      currency: "XAF", // Central African Franc for Cameroon
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };
  }

  /**
   * Create payment intent for order
   */
  async createPaymentIntent(
    amount: number,
    orderId: string,
    customerInfo: {
      name?: string;
      email?: string;
      phone?: string;
    },
    shopName?: string
  ): Promise<PaymentResult> {
    try {
      return await retry(
        () =>
          this.provider.createPaymentIntent(
            amount,
            orderId,
            customerInfo,
            shopName
          ),
        this.config.maxRetries,
        this.config.retryDelay
      );
    } catch (error) {
      console.error("Failed to create payment intent:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create payment intent",
      };
    }
  }

  /**
   * Verify payment intent status
   */
  async verifyPaymentIntent(
    paymentIntentId: string
  ): Promise<PaymentVerification | null> {
    try {
      return await retry(
        () => this.provider.verifyPaymentIntent(paymentIntentId),
        this.config.maxRetries,
        this.config.retryDelay
      );
    } catch (error) {
      console.error("Failed to verify payment intent:", error);
      return null;
    }
  }

  /**
   * Confirm payment intent (for 3D Secure or other authentication)
   */
  async confirmPaymentIntent(paymentIntentId: string): Promise<PaymentResult> {
    try {
      return await retry(
        () => this.provider.confirmPaymentIntent(paymentIntentId),
        this.config.maxRetries,
        this.config.retryDelay
      );
    } catch (error) {
      console.error("Failed to confirm payment intent:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to confirm payment intent",
      };
    }
  }

  /**
   * Cancel payment intent
   */
  async cancelPaymentIntent(
    paymentIntentId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      return await retry(
        () => this.provider.cancelPaymentIntent(paymentIntentId),
        this.config.maxRetries,
        this.config.retryDelay
      );
    } catch (error) {
      console.error("Failed to cancel payment intent:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to cancel payment intent",
      };
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhookEvent(
    payload: string | Buffer,
    signature: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      return await retry(
        () => this.provider.handleWebhookEvent(payload, signature),
        this.config.maxRetries,
        this.config.retryDelay
      );
    } catch (error) {
      console.error("Failed to handle webhook event:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to handle webhook event",
      };
    }
  }

  /**
   * Create payment link for simple payments
   */
  async createPaymentLink(
    amount: number,
    productName: string,
    orderId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      return await retry(
        () =>
          this.provider.createPaymentLink(
            amount,
            productName,
            orderId,
            successUrl,
            cancelUrl
          ),
        this.config.maxRetries,
        this.config.retryDelay
      );
    } catch (error) {
      console.error("Failed to create payment link:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create payment link",
      };
    }
  }

  /**
   * Get payment intent by ID
   */
  async getPaymentIntent(
    paymentIntentId: string
  ): Promise<PaymentIntent | null> {
    try {
      const verification = await this.verifyPaymentIntent(paymentIntentId);
      if (!verification) return null;

      return {
        id: verification.paymentIntentId,
        client_secret: `pi_${verification.paymentIntentId}_secret`,
        amount: verification.amount,
        currency: verification.currency,
        status: verification.status,
        metadata: verification.metadata,
      };
    } catch (error) {
      console.error("Failed to get payment intent:", error);
      return null;
    }
  }

  /**
   * Get currency for operations
   */
  getCurrency(): string {
    return this.config.currency.toLowerCase();
  }

  /**
   * Validate payment amount
   */
  validatePaymentAmount(amount: number): { valid: boolean; error?: string } {
    if (amount <= 0) {
      return { valid: false, error: "Amount must be greater than 0" };
    }

    if (amount > 1000000) {
      // 1 million FCFA limit
      return { valid: false, error: "Amount exceeds maximum limit" };
    }

    return { valid: true };
  }
}

// Factory function to create payment service with appropriate provider
export function createPaymentService(
  paymentConfig?: {
    provider?: string;
    lygosApiKey?: string;
    lygosShopName?: string;
  },
  serviceConfig?: Partial<PaymentServiceConfig>
) {
  let provider: PaymentProvider;

  // Check if payment configuration is provided (from admin settings)
  if (paymentConfig?.provider === "lygos" && paymentConfig?.lygosApiKey) {
    provider = new LygosPaymentProvider(paymentConfig.lygosApiKey);
  } else if (process.env.LYGOS_API_KEY) {
    // Fallback to environment variable
    provider = new LygosPaymentProvider(process.env.LYGOS_API_KEY);
  } else {
    // Fallback to mock provider for development
    provider = new MockPaymentProvider();
  }
  return new PaymentService(provider, serviceConfig);
}

// Export singleton instance with auto-detected provider
export const paymentService = createPaymentService();
