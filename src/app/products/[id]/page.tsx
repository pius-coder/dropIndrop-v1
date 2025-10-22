"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ShoppingCart,
  ArrowLeft,
  Package,
  DollarSign,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  viewCount: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetchProduct();
    checkAuthentication();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/public/products/${productId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Product not found");
        } else {
          setError("Failed to load product");
        }
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

  const checkAuthentication = async () => {
    try {
      const response = await fetch("/api/auth/me");
      setIsAuthenticated(response.ok);
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handlePurchase = () => {
    if (!isAuthenticated) {
      // Redirect to authentication
      router.push(`/auth/client?redirect=/products/${productId}`);
      return;
    }

    // Redirect to order creation
    router.push(`/orders/create?productId=${productId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading product...</p>
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
                <h2 className="text-lg font-semibold">Product Not Available</h2>
                <p className="text-muted-foreground">
                  {error ||
                    "This product could not be found or is no longer available."}
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
            Back
          </Button>
        </div>
      </div>

      {/* Product Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              {product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Image Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{product.category.name}</Badge>
                <Badge variant={product.isAvailable ? "default" : "secondary"}>
                  {product.isAvailable ? "Available" : "Out of Stock"}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  {product.price.toLocaleString()} XAF
                </span>
              </div>

              {product.sku && (
                <p className="text-sm text-muted-foreground mb-4">
                  SKU: {product.sku}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Purchase Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Purchase
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isAuthenticated ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please authenticate to make a purchase.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Price:</span>
                      <span className="font-bold text-lg">
                        {product.price.toLocaleString()} XAF
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-medium">Availability:</span>
                      <Badge
                        variant={product.isAvailable ? "default" : "secondary"}
                      >
                        {product.isAvailable ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handlePurchase}
                  disabled={!product.isAvailable}
                  className="w-full"
                  size="lg"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {isAuthenticated ? "Purchase Now" : "Login to Purchase"}
                </Button>

                {!product.isAvailable && (
                  <p className="text-sm text-muted-foreground text-center">
                    This product is currently out of stock.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Product Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Product Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Views:</span>
                    <p className="font-medium">{product.viewCount}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <p className="font-medium">{product.category.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
