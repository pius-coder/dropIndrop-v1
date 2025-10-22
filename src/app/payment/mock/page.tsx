"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";

export default function MockPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentIntent = searchParams.get("payment_intent");

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-process payment after a short delay for demo purposes
    const timer = setTimeout(() => {
      handlePayment();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handlePayment = async () => {
    if (!paymentIntent) {
      setError("Payment intent not found");
      setPaymentStatus("failed");
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Randomly succeed or fail for demo (90% success rate)
      const shouldSucceed = Math.random() > 0.1;

      if (shouldSucceed) {
        setPaymentStatus("success");

        // Update payment status via API
        await fetch(`/api/payments/webhook`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent,
            status: "succeeded",
            amount: 5000, // Mock amount
          }),
        });

        // Redirect to success page after delay
        setTimeout(() => {
          router.push(`/payment/success?payment_intent=${paymentIntent}`);
        }, 2000);
      } else {
        setPaymentStatus("failed");
        setError("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      setPaymentStatus("failed");
      setError("Payment processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setPaymentStatus("pending");
    setError(null);
    handlePayment();
  };

  const handleCancel = () => {
    router.push(`/payment/cancel?payment_intent=${paymentIntent}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <CreditCard className="h-6 w-6" />
            Mock Payment Gateway
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Status */}
          <div className="text-center">
            {isProcessing ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-muted-foreground">Processing payment...</p>
              </div>
            ) : paymentStatus === "success" ? (
              <div className="flex flex-col items-center space-y-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-lg font-semibold text-green-600">Payment Successful!</p>
                  <p className="text-sm text-muted-foreground">
                    Redirecting to confirmation page...
                  </p>
                </div>
              </div>
            ) : paymentStatus === "failed" ? (
              <div className="flex flex-col items-center space-y-4">
                <XCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-lg font-semibold text-red-600">Payment Failed</p>
                  <p className="text-sm text-muted-foreground">
                    {error || "Please try again"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Ready to Pay</p>
                  <p className="text-sm text-muted-foreground">
                    Mock payment processing
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Intent:</span>
              <span className="font-mono text-xs">{paymentIntent || "N/A"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-semibold">5,000 XAF</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Method:</span>
              <span className="font-semibold">Mock Gateway</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {paymentStatus === "failed" && (
              <>
                <Button onClick={handleRetry} className="flex-1">
                  Try Again
                </Button>
                <Button onClick={handleCancel} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </>
            )}

            {paymentStatus === "pending" && (
              <Button onClick={() => router.push("/")} variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            )}

            {paymentStatus === "success" && (
              <div className="w-full text-center">
                <p className="text-sm text-muted-foreground">
                  Redirecting to confirmation...
                </p>
              </div>
            )}
          </div>

          {/* Demo Notice */}
          <div className="text-center text-xs text-muted-foreground border-t pt-4">
            <p>🔧 This is a mock payment gateway for testing purposes</p>
            <p>Real payments will use MTN MoMo, Orange Money, or other providers</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
