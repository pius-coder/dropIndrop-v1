/**
 * Client Dashboard Page
 * Customer dashboard with orders, tickets, and profile
 */

"use client";

import { useRouter } from "next/navigation";
import { useCustomer } from "@/entities/customer/lib/customer-context";
import { useCustomerDashboard } from "@/features/client-dashboard/lib/use-customer-dashboard";
import { ClientDashboardView } from "@/features/client-dashboard/ui/client-dashboard-view";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClientDashboardPage() {
  const router = useRouter();
  const { customer, logout } = useCustomer();
  const { data, isLoading, error } = useCustomerDashboard();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Accès refusé</h1>
          <p className="text-muted-foreground mb-4">
            Vous devez être connecté pour accéder à votre tableau de bord.
          </p>
          <Button onClick={() => router.push("/auth/login?redirectTo=/client")}>
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement de votre tableau de bord...</span>
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
            Impossible de charger votre tableau de bord.
          </p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mon tableau de bord</h1>
            <p className="text-muted-foreground">
              Bonjour, {customer.name}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>

        <ClientDashboardView data={data} />
      </div>
    </div>
  );
}
