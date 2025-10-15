/**
 * Order List Component
 */

"use client";

import { useState } from "react";
import { useOrders } from "../lib/use-orders";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { OrderListFilters } from "../model/types";

export function OrderList() {
  const [filters, setFilters] = useState<Partial<OrderListFilters>>({});
  const { data, isLoading, error } = useOrders(filters);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <p className="text-destructive">Erreur lors du chargement</p>
        </CardContent>
      </Card>
    );
  }

  const { orders = [], total = 0 } = data || {};

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Commandes</h2>
        <p className="text-muted-foreground">{total} commande(s)</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Aucune commande</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{order.ticketNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.totalPrice.toLocaleString("fr-FR")} FCFA
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge>{order.status}</Badge>
                    <Badge variant="outline">{order.paymentStatus}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
