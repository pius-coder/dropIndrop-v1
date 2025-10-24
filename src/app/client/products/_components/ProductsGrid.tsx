import React from "react";
import ProductCard from "./ProductCard";
import SimplePagination from "@/components/ui/simple-pagination";
import { PublicProduct } from "../hooks/useProducts";

interface ProductsGridProps {
  products: PublicProduct[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onProductClick: (productId: string) => void;
}

/**
 * Grid component displaying products with pagination
 */
export default function ProductsGrid({
  products,
  totalPages,
  currentPage,
  onPageChange,
  onProductClick,
}: ProductsGridProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={onProductClick}
          />
        ))}
      </div>

      {/* Pagination */}
      <SimplePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        className="mt-8"
      />
    </>
  );
}
