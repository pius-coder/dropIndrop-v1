import React from "react";
import { Button } from "@/components/ui/button";

/**
 * Simple pagination component extracted for reusability
 * Follows DRY principle and single responsibility
 */
interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: SimplePaginationProps) {
  if (totalPages <= 1) return null;

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className={`flex justify-center space-x-2 ${className}`}>
      <Button
        variant="outline"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={!canGoPrevious}
      >
        Précédent
      </Button>

      <span className="flex items-center px-4 text-sm text-muted-foreground">
        Page {currentPage} sur {totalPages}
      </span>

      <Button
        variant="outline"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={!canGoNext}
      >
        Suivant
      </Button>
    </div>
  );
}
