import React from "react";
import { Package } from "lucide-react";

interface EmptyProductsStateProps {
  searchQuery?: string;
}

/**
 * Empty state component when no products are found
 */
export default function EmptyProductsState({
  searchQuery,
}: EmptyProductsStateProps) {
  return (
    <div className="text-center py-12">
      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">Aucun produit trouvé</h3>
      <p className="text-muted-foreground">
        {searchQuery
          ? "Aucun produit ne correspond à votre recherche."
          : "Aucun produit n'est disponible pour le moment."}
      </p>
    </div>
  );
}
