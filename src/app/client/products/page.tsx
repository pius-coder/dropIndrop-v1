"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingBag,
  Search,
  Eye,
  Package,
  AlertCircle,
  Filter,
} from "lucide-react";
import Image from "next/image";

// Types for public product data
interface PublicProduct {
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
  stockQuantity: number;
}

interface ProductsResponse {
  success: boolean;
  data: {
    products: PublicProduct[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Client products browsing page
 * Public page where clients can view available products before authentication
 */
export default function ClientProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [currentPage, searchQuery]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/public/products?${params}`);

      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const data: ProductsResponse = await response.json();

      if (data.success) {
        setProducts(data.data.products);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setError("Erreur lors du chargement des produits");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts();
  };

  const handleProductClick = (productId: string) => {
    // Redirect to product detail page (which will handle authentication if needed)
    router.push(`/products/${productId}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
    }).format(amount);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <div>
                <h2 className="text-lg font-semibold">Erreur</h2>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <Button onClick={loadProducts} variant="outline">
                Réessayer
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
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Produits disponibles</h1>
                <p className="text-muted-foreground">
                  Découvrez nos produits et passez commande
                </p>
              </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Rechercher</Button>
            </form>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Header skeleton */}
              <div className="mb-8">
                <Skeleton className="h-8 w-64 mb-4" />
                <Skeleton className="h-4 w-96" />
              </div>

              {/* Search skeleton */}
              <div className="mb-8">
                <Skeleton className="h-10 w-full max-w-md" />
              </div>

              {/* Products grid skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-48 w-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-full mb-2" />
                      <Skeleton className="h-3 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun produit trouvé</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Aucun produit ne correspond à votre recherche."
                : "Aucun produit n'est disponible pour le moment."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleProductClick(product.id)}
                >
                  <CardHeader className="p-0">
                    <div className="aspect-square relative">
                      {product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge
                          variant={
                            product.isAvailable ? "default" : "secondary"
                          }
                        >
                          {product.isAvailable ? "Disponible" : "Indisponible"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(product.price)}
                        </span>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Eye className="h-4 w-4 mr-1" />
                          <span>Voir détails</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{product.category.name}</span>
                        {product.stockQuantity > 0 && (
                          <span>Stock: {product.stockQuantity}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>

                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {currentPage} sur {totalPages}
                </span>

                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
