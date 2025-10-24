import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import Image from "next/image";
import { PublicProduct } from "../hooks/useProducts";
import { formatCurrency } from "@/lib/utils/currency";
import ProductPlaceholderIcon from "@/components/ui/product-placeholder-icon";

interface ProductCardProps {
  product: PublicProduct;
  onClick: (productId: string) => void;
}

/**
 * Individual product card component
 */
export default function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick(product.id)}
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
              <ProductPlaceholderIcon />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant={product.isAvailable ? "default" : "secondary"}>
              {product.isAvailable ? "Disponible" : "Indisponible"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
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
  );
}
