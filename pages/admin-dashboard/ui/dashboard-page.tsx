/**
 * Admin Dashboard Page Component
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Send, ShoppingCart, TrendingUp, AlertCircle, Plus } from "lucide-react";
import { useDashboardStats } from "../model/use-dashboard-stats";
import { useRouter } from "next/navigation";

export function DashboardPage() {
  const router = useRouter();
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <p className="text-destructive">Erreur lors du chargement des statistiques</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Articles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.articles.total}</div>
            <div className="flex items-center gap-2 mt-2">
              {stats.articles.lowStock > 0 && (
                <Badge variant="outline" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {stats.articles.lowStock} stock bas
                </Badge>
              )}
              {stats.articles.outOfStock > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {stats.articles.outOfStock} épuisé
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Drops */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drops</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drops.total}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge variant="secondary" className="text-xs">
                {stats.drops.draft} brouillon
              </Badge>
              <Badge variant="outline" className="text-xs">
                {stats.drops.sent} envoyé
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders.total}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge variant="outline" className="text-xs">
                {stats.orders.pending} en attente
              </Badge>
              <Badge variant="default" className="text-xs">
                {stats.orders.paid} payé
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.revenue.thisMonth.toLocaleString("fr-FR")} F
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Ce mois
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Button
              onClick={() => router.push("/admin/articles/new")}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvel article
            </Button>
            <Button
              onClick={() => router.push("/admin/drops/new")}
              className="w-full"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouveau drop
            </Button>
            <Button
              onClick={() => router.push("/admin/orders/validate")}
              className="w-full"
              variant="outline"
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              Valider ticket
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {(stats.articles.lowStock > 0 || stats.articles.outOfStock > 0) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-yellow-800">
            {stats.articles.outOfStock > 0 && (
              <p>
                ⚠️ {stats.articles.outOfStock} article(s) en rupture de stock
              </p>
            )}
            {stats.articles.lowStock > 0 && (
              <p>
                📦 {stats.articles.lowStock} article(s) avec stock bas
              </p>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push("/admin/articles")}
              className="mt-2"
            >
              Gérer les articles
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
