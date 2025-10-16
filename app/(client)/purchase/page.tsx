/**
 * Purchase Flow Page
 * Handles article purchase with authentication
 */

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCustomer } from "@/entities/customer/lib/customer-context";
import { ShoppingCart, ArrowLeft, LogIn } from "lucide-react";
import { formatPrice } from "@/shared/lib";

interface Article {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  code: string;
}

export default function PurchasePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, customer } = useCustomer();

  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const articleId = searchParams ? searchParams.get("articleId") : null;

  useEffect(() => {
    if (articleId) {
      // Fetch article details
      fetch(`/api/articles/${articleId}`)
        .then((response) => response.json())
        .then((data) => {
          setArticle(data);
        })
        .catch((error) => {
          console.error("Error fetching article:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [articleId]);

  const handleAuthRequired = () => {
    router.push(`/auth/login?redirectTo=/purchase?articleId=${articleId}`);
  };

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">
                Article introuvable
              </h2>
              <Button onClick={handleGoBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If not authenticated, redirect to auth page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Article Preview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Confirmer votre commande
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <img
                  src={article.images[0]}
                  alt={article.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{article.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {article.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">
                      {formatPrice(article.price)}
                    </span>
                    <Badge
                      variant={article.stock > 0 ? "default" : "destructive"}
                    >
                      {article.stock} en stock
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auth Required */}
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto">
                  <LogIn className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Connexion requise
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Vous devez vous connecter pour continuer votre commande
                  </p>
                </div>
                <Button onClick={handleAuthRequired} className="w-full">
                  <LogIn className="mr-2 h-4 w-4" />
                  Se connecter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If authenticated, show purchase confirmation
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
                <p> {customer?.name}</p>
                <p> {customer?.phone}</p>
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
                  <p className="text-sm text-muted-foreground">
                    {article.code}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(article.price)}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg">
                {formatPrice(article.price)}
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                Procéder au paiement
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoBack}
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
