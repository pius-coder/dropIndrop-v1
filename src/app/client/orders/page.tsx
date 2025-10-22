"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingBag,
  CreditCard,
  Package,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

// Types for client data
interface ClientOrder {
  id: string;
  orderNumber: string;
  status: "PENDING" | "PAID" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
  };
}

interface ClientData {
  id: string;
  username: string;
  phoneNumber: string;
  orders: ClientOrder[];
  tickets: any[];
}

/**
 * Client orders page
 */
export default function ClientOrdersPage() {
  const router = useRouter();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClientData();
  }, []);

  const loadClientData = async () => {
    try {
      const response = await fetch("/api/client/dashboard");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setClientData(data.data);
        }
      }
    } catch (error) {
      console.error("Error loading client data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "outline" as const, label: "En attente" },
      PAID: { variant: "default" as const, label: "Payée" },
      DELIVERED: { variant: "default" as const, label: "Livrée" },
      CANCELLED: { variant: "destructive" as const, label: "Annulée" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <CreditCard className="h-5 w-5 text-orange-500" />;
      case "PAID":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "DELIVERED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "CANCELLED":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/client")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Skeleton className="h-8 w-32" />
        </div>

        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-5 w-5" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.push("/client")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <Alert className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erreur lors du chargement de vos données.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-col gap-1.5">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/client")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Mes commandes</h1>
            <p className="text-muted-foreground">
              Suivez l'état de vos commandes
            </p>
          </div>
        </div>

        <Button onClick={() => router.push("/client/products")}>
          <Package className="h-4 w-4 mr-2" />
          Découvrir les produits
        </Button>
      </div>

      {/* Orders List */}
      {clientData.orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune commande</h3>
            <p className="text-muted-foreground text-center mb-4">
              Vous n'avez encore passé aucune commande.
            </p>
            <Button onClick={() => router.push("/client/products")}>
              Découvrir les produits
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {clientData.orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <div>
                        <CardTitle className="text-base">
                          {order.product.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Commande #{order.orderNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Commandé le {formatDate(order.createdAt)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.product.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {order.status === "PENDING" && "En attente de paiement"}
                      {order.status === "PAID" && "Payée - En préparation"}
                      {order.status === "DELIVERED" && "Livrée"}
                      {order.status === "CANCELLED" && "Annulée"}
                    </div>
                  </div>
                </div>

                {/* Status Flow Indicator */}
                <div className="mt-4 flex items-center justify-between text-xs">
                  <div
                    className={`flex items-center space-x-1 ${
                      order.status === "PENDING"
                        ? "text-orange-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        order.status === "PENDING"
                          ? "bg-orange-500"
                          : "bg-muted-foreground"
                      }`}
                    />
                    <span>Commande</span>
                  </div>
                  <div
                    className={`flex items-center space-x-1 ${
                      order.status === "PAID" || order.status === "DELIVERED"
                        ? "text-blue-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        order.status === "PAID" || order.status === "DELIVERED"
                          ? "bg-blue-500"
                          : "bg-muted-foreground"
                      }`}
                    />
                    <span>Paiement</span>
                  </div>
                  <div
                    className={`flex items-center space-x-1 ${
                      order.status === "DELIVERED"
                        ? "text-green-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        order.status === "DELIVERED"
                          ? "bg-green-500"
                          : "bg-muted-foreground"
                      }`}
                    />
                    <span>Livraison</span>
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
