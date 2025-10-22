"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingBag,
  Ticket,
  Package,
  TrendingUp,
  AlertCircle,
  Plus,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

interface ClientTicket {
  id: string;
  uniqueCode: string;
  isUsed: boolean;
  expiresAt: string;
  createdAt: string;
  order: {
    orderNumber: string;
    totalAmount: number;
    product: {
      name: string;
    };
  };
}

interface ClientStats {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalTickets: number;
  activeTickets: number;
}

interface ClientData {
  id: string;
  username: string;
  phoneNumber: string;
  orders: ClientOrder[];
  tickets: ClientTicket[];
}

/**
 * Client dashboard home page
 */
export default function ClientDashboardHome() {
  const router = useRouter();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [stats, setStats] = useState<ClientStats | null>(null);
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
          calculateStats(data.data);
        }
      }
    } catch (error) {
      console.error("Error loading client data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: ClientData) => {
    const stats: ClientStats = {
      totalOrders: data.orders.length,
      pendingOrders: data.orders.filter((o) => o.status === "PENDING").length,
      deliveredOrders: data.orders.filter((o) => o.status === "DELIVERED")
        .length,
      totalTickets: data.tickets.length,
      activeTickets: data.tickets.filter((t) => !t.isUsed).length,
    };
    setStats(stats);
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
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent activity skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientData || !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <Alert className="max-w-md">
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
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          Bienvenue, {clientData.username}!
        </h1>
        <p className="text-muted-foreground">
          Gérez vos commandes et suivez vos livraisons
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total commandes
                </p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  En attente
                </p>
                <p className="text-2xl font-bold">{stats.pendingOrders}</p>
              </div>
              <Package className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Livrées
                </p>
                <p className="text-2xl font-bold">{stats.deliveredOrders}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tickets actifs
                </p>
                <p className="text-2xl font-bold">{stats.activeTickets}</p>
              </div>
              <Ticket className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Commandes récentes</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/client/orders")}
              >
                Voir tout
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientData.orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune commande récente</p>
                <Button
                  onClick={() => router.push("/client/products")}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Découvrir les produits
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {clientData.orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <p className="font-medium">{order.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        #{order.orderNumber} • {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <Badge
                        variant={
                          order.status === "DELIVERED" ? "default" : "secondary"
                        }
                      >
                        {order.status === "PENDING" && "En attente"}
                        {order.status === "PAID" && "Payée"}
                        {order.status === "DELIVERED" && "Livrée"}
                        {order.status === "CANCELLED" && "Annulée"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tickets actifs</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/client/tickets")}
              >
                Voir tout
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientData.tickets.filter((t) => !t.isUsed).length === 0 ? (
              <div className="text-center py-8">
                <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun ticket actif</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clientData.tickets
                  .filter((t) => !t.isUsed)
                  .slice(0, 3)
                  .map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center space-x-4"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {ticket.order.product.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          #{ticket.uniqueCode} • {formatDate(ticket.createdAt)}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Voir
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              onClick={() => router.push("/client/products")}
              className="h-auto p-6 flex-col space-y-2"
            >
              <Package className="h-8 w-8" />
              <span>Découvrir les produits</span>
            </Button>

            <Button
              onClick={() => router.push("/client/orders")}
              variant="outline"
              className="h-auto p-6 flex-col space-y-2"
            >
              <ShoppingBag className="h-8 w-8" />
              <span>Voir mes commandes</span>
            </Button>

            <Button
              onClick={() => router.push("/client/tickets")}
              variant="outline"
              className="h-auto p-6 flex-col space-y-2"
            >
              <Ticket className="h-8 w-8" />
              <span>Gérer mes tickets</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
