/**
 * Client Dashboard View Component
 * Displays customer dashboard with stats, orders, and tickets
 */

"use client";

import { formatPrice } from "@/shared/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingBag,
  Ticket,
  TrendingUp,
  Calendar,
  Eye,
  Download,
  Share2,
  Plus
} from "lucide-react";

interface ClientDashboardData {
  stats: {
    totalOrders: number;
    totalSpent: number;
    activeTickets: number;
    memberSince: string;
  };
  recentOrders: any[];
  activeTickets: any[];
}

interface ClientDashboardViewProps {
  data: ClientDashboardData;
}

export function ClientDashboardView({ data }: ClientDashboardViewProps) {
  const { stats, recentOrders, activeTickets } = data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total commandes</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Depuis votre inscription
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total dépensé</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              Toutes vos commandes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets actifs</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTickets}</div>
            <p className="text-xs text-muted-foreground">
              À récupérer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membre depuis</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{formatDate(stats.memberSince)}</div>
            <p className="text-xs text-muted-foreground">
              Date d'inscription
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Commandes récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Aucune commande récente</p>
                <Button
                  className="mt-4"
                  onClick={() => window.location.href = "/"}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Faire une commande
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <img
                      src={order.article.images[0]}
                      alt={order.article.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{order.article.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(Number(order.amount))}</p>
                      <Badge variant={order.paymentStatus === "PAID" ? "default" : "secondary"}>
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Eye className="mr-2 h-4 w-4" />
                  Voir toutes les commandes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Tickets actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTickets.length === 0 ? (
              <div className="text-center py-8">
                <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Aucun ticket actif</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Vos tickets apparaîtront ici après achat
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={ticket.article.images[0]}
                        alt={ticket.article.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{ticket.article.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Code: {ticket.ticketCode}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {ticket.pickupStatus}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="mr-2 h-3 w-3" />
                        Voir
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Share2 className="mr-2 h-3 w-3" />
                        Partager
                      </Button>
                    </div>

                    {ticket.ticketExpiresAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Expire le {formatDate(ticket.ticketExpiresAt)}
                      </p>
                    )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              className="h-20 flex-col gap-2"
              onClick={() => window.location.href = "/"}
            >
              <ShoppingBag className="h-6 w-6" />
              <span>Continuer mes achats</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => window.location.href = "/client/tickets"}
            >
              <Ticket className="h-6 w-6" />
              <span>Mes tickets</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => window.location.href = "/support"}
            >
              <span className="text-lg">💬</span>
              <span>Support</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => window.location.href = "/account"}
            >
              <span className="text-lg">⚙️</span>
              <span>Mon compte</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
