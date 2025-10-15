/**
 * Admin Orders Page Component
 * 
 * Integrates:
 * - order-list
 * - order-validate
 */

"use client";

import { OrderList } from "@/features/order-list";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function OrdersPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Commandes</h1>
          <p className="text-muted-foreground">Gérer les commandes et validations</p>
        </div>
        <Button onClick={() => router.push("/admin/orders/validate")}>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Valider ticket
        </Button>
      </div>

      {/* Order List */}
      <OrderList />
    </div>
  );
}
