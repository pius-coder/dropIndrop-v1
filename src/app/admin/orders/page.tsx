"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  AlertCircle,
  Package,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

// Types for admin order data
interface AdminOrder {
  id: string;
  orderNumber: string;
  status: "PENDING" | "PAID" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    username: string;
    phoneNumber: string;
    email?: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      sku: string;
      images: string[];
    };
  }>;
  tickets?: Array<{
    id: string;
    uniqueCode: string;
    isUsed: boolean;
    usedAt?: string;
    createdAt: string;
  }>;
}

interface OrdersResponse {
  success: boolean;
  data: {
    orders: AdminOrder[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Admin orders management page
 */
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadOrders();
  }, [currentPage, searchQuery, statusFilter]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await fetch(`/api/admin/orders?${params}`);
      if (response.ok) {
        const data: OrdersResponse = await response.json();
        if (data.success) {
          setOrders(data.data.orders);
          setTotalPages(data.data.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        variant: "outline" as const,
        label: "En attente",
        icon: Clock,
        color: "text-orange-500",
      },
      PAID: {
        variant: "default" as const,
        label: "Payée",
        icon: CheckCircle,
        color: "text-blue-500",
      },
      DELIVERED: {
        variant: "default" as const,
        label: "Livrée",
        icon: Package,
        color: "text-green-500",
      },
      CANCELLED: {
        variant: "destructive" as const,
        label: "Annulée",
        icon: XCircle,
        color: "text-red-500",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
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
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Table skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des commandes</h1>
          <p className="text-muted-foreground">
            Gérez et suivez toutes les commandes des clients
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtres avancés
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres et recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par commande, client, produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="PAID">Payées</SelectItem>
                <SelectItem value="DELIVERED">Livrées</SelectItem>
                <SelectItem value="CANCELLED">Annulées</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={loadOrders} variant="outline">
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des commandes ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Aucune commande trouvée
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Aucune commande ne correspond aux critères de recherche."
                  : "Aucune commande n'a encore été passée."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commande</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">#{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.items.length} article
                            {order.items.length > 1 ? "s" : ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {order.customer.username}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.customer.phoneNumber}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {order.items[0]?.product.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            SKU: {order.items[0]?.product.sku}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <p className="text-sm">{formatDate(order.createdAt)}</p>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5" />
              <span>Détails de la commande #{selectedOrder?.orderNumber}</span>
            </DialogTitle>
            <DialogDescription>
              Informations complètes sur la commande et le client
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informations commande</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Numéro:</span>
                      <span className="font-medium">
                        #{selectedOrder.orderNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Montant total:
                      </span>
                      <span className="font-medium">
                        {formatCurrency(selectedOrder.totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Créée le:</span>
                      <span className="font-medium">
                        {formatDate(selectedOrder.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Dernière mise à jour:
                      </span>
                      <span className="font-medium">
                        {formatDate(selectedOrder.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Informations client</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nom:</span>
                      <span className="font-medium">
                        {selectedOrder.customer.username}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Téléphone:</span>
                      <span className="font-medium">
                        {selectedOrder.customer.phoneNumber}
                      </span>
                    </div>
                    {selectedOrder.customer.email && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">
                          {selectedOrder.customer.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <h4 className="font-medium mb-2">Produits commandés</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {item.product.images.length > 0 ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            SKU: {item.product.sku} • Qté: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tickets */}
              {selectedOrder.tickets && selectedOrder.tickets.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tickets de livraison</h4>
                  <div className="space-y-2">
                    {selectedOrder.tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                            <Ticket className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">#{ticket.uniqueCode}</p>
                            <p className="text-sm text-muted-foreground">
                              Créé le {formatDate(ticket.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={ticket.isUsed ? "secondary" : "default"}
                        >
                          {ticket.isUsed ? "Utilisé" : "Valide"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1"
                >
                  Fermer
                </Button>
                <Button
                  onClick={() => {
                    // Handle status update or other actions
                    console.log("Update order status for:", selectedOrder.id);
                  }}
                  className="flex-1"
                >
                  Modifier le statut
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
