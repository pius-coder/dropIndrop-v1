/**
 * Article View Page Component
 * 
 * Public article detail with order form
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, ShoppingCart, Package, AlertCircle } from "lucide-react";
import { OrderCreateForm, OrderSuccessDisplay } from "@/features/order-create";
import type { CreateOrderResponse } from "@/features/order-create";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ArticleViewPageProps {
  articleSlug: string;
}

export function ArticleViewPage({ articleSlug }: ArticleViewPageProps) {
  const router = useRouter();
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderResponse, setOrderResponse] = useState<CreateOrderResponse | null>(null);

  // Mock article data (will be fetched via API)
  const article = {
    id: "article-1",
    name: "iPhone 15 Pro Max 256GB",
    description: "Le dernier iPhone d'Apple avec puce A17 Pro, appareil photo 48MP et écran Super Retina XDR de 6.7 pouces. État neuf, garantie 1 an.",
    price: 850000,
    stock: 5,
    minStock: 2,
    images: [
      "https://placehold.co/600x400/e2e8f0/1e293b?text=iPhone+15+Pro",
      "https://placehold.co/600x400/e2e8f0/1e293b?text=Image+2",
      "https://placehold.co/600x400/e2e8f0/1e293b?text=Image+3",
    ],
    videos: [],
    category: { name: "Smartphones" },
    inStock: true,
    isLowStock: true,
  };

  const [currentImage, setCurrentImage] = useState(0);

  if (!article) {
    return (
      <div className="container py-12">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <p className="text-destructive">Article non trouvé</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 md:py-12">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <Card>
              <CardContent className="p-0">
                <img
                  src={article.images[currentImage]}
                  alt={article.name}
                  className="w-full aspect-square object-cover rounded-lg"
                />
              </CardContent>
            </Card>

            {/* Thumbnails */}
            {article.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {article.images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`border-2 rounded overflow-hidden ${
                      currentImage === idx
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${article.name} ${idx + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Category */}
            <div>
              <Badge variant="outline">{article.category.name}</Badge>
            </div>

            {/* Title & Price */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {article.name}
              </h1>
              <div className="text-3xl md:text-4xl font-bold text-primary">
                {article.price.toLocaleString("fr-FR")} FCFA
              </div>
            </div>

            {/* Stock Status */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {article.inStock ? (
                    <>
                      <Package className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium text-green-700">En stock</p>
                        {article.isLowStock && (
                          <p className="text-sm text-yellow-600">
                            ⚠️ Stock limité ({article.stock} restant)
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium text-red-700">Rupture de stock</p>
                        <p className="text-sm text-muted-foreground">
                          Revenez bientôt
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {article.description}
              </p>
            </div>

            {/* Order Button */}
            <Button
              size="lg"
              className="w-full"
              disabled={!article.inStock}
              onClick={() => setShowOrderForm(true)}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {article.inStock ? "Commander maintenant" : "Indisponible"}
            </Button>

            {/* Info */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <span>📦</span>
                    <span>Retrait en magasin</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span>💳</span>
                    <span>Paiement MTN/Orange Money</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span>✅</span>
                    <span>Garantie incluse</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Order Form Dialog */}
      <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Passer commande</DialogTitle>
          </DialogHeader>
          {!orderResponse ? (
            <OrderCreateForm
              articleId={article.id}
              articleName={article.name}
              articlePrice={article.price}
              onSuccess={(response) => {
                setOrderResponse(response);
              }}
            />
          ) : (
            <OrderSuccessDisplay
              response={orderResponse}
              onClose={() => {
                setOrderResponse(null);
                setShowOrderForm(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
