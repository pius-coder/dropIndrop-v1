"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  customer: {
    username: string;
    email?: string;
    phoneNumber: string;
  };
  items: Array<{
    product: {
      name: string;
      price: number;
    };
    quantity: number;
    unitPrice: number;
  }>;
}

export default function OrderPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);

      if (!response.ok) {
        setError("Order not found");
        return;
      }

      const data = await response.json();
      if (data.order) {
        setOrder(data.order);
      } else {
        setError("Order not found");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setError("Failed to load order");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiatePayment = async () => {
    if (!order) return;

    try {
      setIsProcessingPayment(true);
      setError(null);

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "initiate_payment",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to initiate payment");
        return;
      }

      if (data.paymentIntent?.redirectUrl) {
        setPaymentUrl(data.paymentIntent.redirectUrl);
        // Redirect to payment gateway
        window.location.href = data.paymentIntent.redirectUrl;
      } else {
        setError("Payment gateway URL not received");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      setError("Failed to initiate payment");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <div>
                <h2 className="text-lg font-semibold">Order Not Found</h2>
                <p className="text-muted-foreground">
                  {error ||
                    "This order could not be found or is no longer available."}
                </p>
              </div>
              <Button onClick={() => router.push("/")} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>

      {/* Payment Processing */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Summary */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Order Number:</span>
                  <span className="font-mono">{order.orderNumber}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Customer:</span>
                  <span>{order.customer.username}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Phone:</span>
                  <span>{order.customer.phoneNumber}</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span>{order.totalAmount.toLocaleString()} XAF</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-medium mb-3">Order Items</h3>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 border rounded"
                    >
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} ×{" "}
                          {item.unitPrice.toLocaleString()} XAF
                        </p>
                      </div>
                      <p className="font-medium">
                        {(item.quantity * item.unitPrice).toLocaleString()} XAF
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Payment Button */}
              <Button
                onClick={handleInitiatePayment}
                disabled={isProcessingPayment}
                className="w-full"
                size="lg"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay {order.totalAmount.toLocaleString()} XAF
                  </>
                )}
              </Button>

              {paymentUrl && (
                <Alert className="border-blue-200 bg-blue-50">
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Redirecting to payment gateway...
                  </AlertDescription>
                </Alert>
              )}

              {/* Payment Info */}
              <div className="text-center text-sm text-muted-foreground">
                <p>You will be redirected to a secure payment page.</p>
                <p>Your order will be confirmed once payment is completed.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
