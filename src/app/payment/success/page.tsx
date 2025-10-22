"use client";

import React, { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentIntent = searchParams.get("payment_intent");
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    // Update order status if we have the payment intent
    if (paymentIntent) {
      // The webhook should have already updated the order status
      // This is just for UI feedback
      console.log("Payment successful for intent:", paymentIntent);
    }
  }, [paymentIntent]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div>
            <p className="text-lg mb-2">Your order has been confirmed</p>
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
              onClick={() => router.push("/orders")}
              className="w-full"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              View My Orders
            </Button>

            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full"
            >
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground border-t pt-4">
            <p>You will receive a confirmation via WhatsApp shortly</p>
            <p>Thank you for your purchase!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
