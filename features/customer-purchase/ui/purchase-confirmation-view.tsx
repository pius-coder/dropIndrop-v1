/**
 * Purchase Confirmation View Component
 * Shows article details and payment method selection
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/shared/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, ArrowLeft, CreditCard, Smartphone } from "lucide-react";
import type { ArticleWithRelations } from "@/entities/article";

interface PurchaseConfirmationData {
  article: ArticleWithRelations;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
}

interface PurchaseConfirmationViewProps {
  data: PurchaseConfirmationData;
}

export function PurchaseConfirmationView({ data }: PurchaseConfirmationViewProps) {
  const router = useRouter();
  const { article, customer } = data;
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPaymentMethod) return;

    setIsProcessing(true);
    try {
      // Initiate payment
      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("customerToken")}`,
        },
        body: JSON.stringify({
          articleId: article.id,
          paymentMethod: selectedPaymentMethod,
          customerId: customer.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initiate payment");
      }

      const paymentData = await response.json();

      // Redirect to payment processor or show instructions
      if (paymentData.paymentUrl) {
        window.location.href = paymentData.paymentUrl;
      } else {
        // Show payment instructions
        router.push(`/buy/success?orderId=${paymentData.orderId}`);
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      alert("Erreur lors de l'initiation du paiement");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Confirmer votre commande
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer Info */}
            <div>
              <h3 className="font-semibold mb-2">Informations client</h3>
              <div className="text-sm text-muted-foreground">
                <p>👤 {customer.name}</p>
                <p>📱 {customer.phone}</p>
              </div>
            </div>

            <Separator />

            {/* Article Details */}
            <div>
              <h3 className="font-semibold mb-2">Article commandé</h3>
              <div className="flex gap-3">
                <img
                  src={article.images[0]}
                  alt={article.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium">{article.name}</p>
                  <p className="text-sm text-muted-foreground">{article.code}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(Number(article.price))}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Method Selection */}
            <div>
              <h3 className="font-semibold mb-3">Méthode de paiement</h3>
              <div className="space-y-2">
                <div
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPaymentMethod === "MTN_MOMO"
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  }`}
                  onClick={() => handlePaymentMethodSelect("MTN_MOMO")}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center">
                      <Smartphone className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">MTN Mobile Money</p>
                      <p className="text-sm text-muted-foreground">
                        Paiement par MTN Money
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPaymentMethod === "ORANGE_MONEY"
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  }`}
                  onClick={() => handlePaymentMethodSelect("ORANGE_MONEY")}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                      <Smartphone className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Orange Money</p>
                      <p className="text-sm text-muted-foreground">
                        Paiement par Orange Money
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg">{formatPrice(Number(article.price))}</span>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={handleConfirmPurchase}
                disabled={!selectedPaymentMethod || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <CreditCard className="mr-2 h-4 w-4 animate-pulse" />
                    Traitement du paiement...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Confirmer le paiement
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoBack}
                disabled={isProcessing}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Modifier la commande
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
