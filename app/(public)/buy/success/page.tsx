/**
 * Purchase Success Page
 * Shows order confirmation and ticket details
 */

"use client";

import { useSearchParams } from "next/navigation";
import { useOrderSuccess } from "@/features/customer-purchase/lib/use-order-success";
import { OrderSuccessView } from "@/features/customer-purchase/ui/order-success-view";
import { Loader2 } from "lucide-react";

export default function PurchaseSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const { data, isLoading, error } = useOrderSuccess(orderId || "");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement de votre commande...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Commande introuvable</h1>
          <p className="text-muted-foreground mb-4">
            Nous n'avons pas pu trouver votre commande.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return <OrderSuccessView data={data} />;
}
