"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  XCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentIntent = searchParams.get("payment_intent");
  const orderId = searchParams.get("order_id");

  const handleRetryPayment = () => {
    if (orderId) {
      router.push(`/orders/${orderId}/pay`);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-red-600">Payment Cancelled</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div>
            <p className="text-lg mb-2">Payment was cancelled or failed</p>
            <p className="text-sm text-muted-foreground">
              Payment ID: {paymentIntent || "N/A"}
            </p>
            {orderId && (
              <p className="text-sm text-muted-foreground">
                Order ID: {orderId}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleRetryPayment}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Payment Again
            </Button>

            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full"
            >
              Back to Home
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground border-t pt-4">
            <p>If you need help, please contact support</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
