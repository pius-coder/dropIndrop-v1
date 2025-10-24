import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Search } from "lucide-react";

interface ProductsHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

/**
 * Header component containing title and search form
 */
export default function ProductsHeader({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}: ProductsHeaderProps) {
  return (
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
          <form onSubmit={onSearchSubmit} className="flex gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Rechercher</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
