/**
 * Buy Now Button Component
 * Handles article purchase with authentication check
 */

"use client";

import { useState } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomer } from "@/entities/customer/lib/customer-context";
import type { ArticleWithRelations } from "@/entities/article";

interface BuyNowButtonProps {
  article: ArticleWithRelations;
  onBuyClick: () => void;
  disabled?: boolean;
}

export function BuyNowButton({
  article,
  onBuyClick,
  disabled = false,
}: BuyNowButtonProps) {
  const { isAuthenticated } = useCustomer();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      onBuyClick();
    } finally {
      setIsLoading(false);
    }
  };

  if (disabled) {
    return (
      <Button disabled className="w-full" size="lg">
        <ShoppingCart className="mr-2 h-5 w-5" />
        Indisponible
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Traitement...
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-5 w-5" />
          Acheter maintenant
        </>
      )}
    </Button>
  );
}
