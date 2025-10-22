"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ShoppingCart,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CreditCard,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: {
    id: string;
    name: string;
  };
  sku?: string;
  isAvailable: boolean;
}

export default function CreateOrderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("productId");

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthentication();
    if (productId) {
      fetchProduct(productId);
    }
  }, [productId]);

  const checkAuthentication = async () => {
    try {
      const response = await fetch("/api/auth/me");
      setIsAuthenticated(response.ok);
    } catch {
      setIsAuthenticated(false);
    }
  };

  const fetchProduct = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/public/products/${id}`);

      if (!response.ok) {
        setError("Product not found");
        return;
      }

      const data = await response.json();
      if (data.success) {
        setProduct(data.data);
      } else {
        setError(data.error || "Failed to load product");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Failed to load product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!product || !isAuthenticated) return;

    try {
      setIsCreatingOrder(true);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              productId: product.id,
              quantity: 1,
              unitPrice: product.price,
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create order");
        return;
      }

      // Redirect to payment processing
      router.push(`/orders/${data.order.id}/pay`);
    } catch (error) {
      console.error("Error creating order:", error);
      setError("Failed to create order");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <div>
                <h2 className="text-lg font-semibold">
                  Unable to Process Order
                </h2>
                <p className="text-muted-foreground">
                  {error || "This product is not available for purchase."}
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-blue-500 mx-auto" />
              <div>
                <h2 className="text-lg font-semibold">
                  Authentication Required
                </h2>
                <p className="text-muted-foreground">
                  Please authenticate to complete your purchase.
                </p>
              </div>
              <Button onClick={() => router.push("/auth/client")}>
                Login with WhatsApp
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
            onClick={() => router.push(`/products/${product.id}`)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Product
          </Button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product Details */}
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {product.category.name}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Quantity: 1
                    </span>
                    <span className="font-semibold">
                      {product.price.toLocaleString()} XAF
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span>{product.price.toLocaleString()} XAF</span>
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

              {/* Purchase Button */}
              <Button
                onClick={handleCreateOrder}
                disabled={isCreatingOrder || !product.isAvailable}
                className="w-full"
                size="lg"
              >
                {isCreatingOrder ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceed to Payment
                  </>
                )}
              </Button>

              {!product.isAvailable && (
                <p className="text-sm text-muted-foreground text-center">
                  This product is currently out of stock.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
