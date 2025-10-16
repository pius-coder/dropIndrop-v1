/**
 * Purchase Confirmation Page
 * Shows article details and initiates payment flow
 */

"use client";

import { useParams } from "next/navigation";
import { usePurchaseConfirmation } from "@/features/customer-purchase/lib/use-purchase";
import { PurchaseConfirmationView } from "@/features/customer-purchase/ui/purchase-confirmation-view";
import { Loader2 } from "lucide-react";

export default function PurchaseConfirmationPage() {
  const params = useParams();
  const articleId = params.articleId as string;

  const { data, isLoading, error } = usePurchaseConfirmation(articleId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement de la commande...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Erreur</h1>
          <p className="text-muted-foreground mb-4">
            Impossible de charger les détails de la commande.
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

  return <PurchaseConfirmationView data={data} />;
}
