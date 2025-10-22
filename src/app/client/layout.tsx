"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ShoppingBag,
  Ticket,
  User,
  LogOut,
  Home,
  Package,
} from "lucide-react";

/**
 * Client layout component with tabbed navigation
 */
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
      router.push("/");
    }
  };

  const navigationItems = [
    {
      label: "Accueil",
      href: "/client",
      icon: Home,
      active: pathname === "/client",
    },
    {
      label: "Produits",
      href: "/client/products",
      icon: Package,
      active: pathname === "/client/products",
    },
    {
      label: "Commandes",
      href: "/client/orders",
      icon: ShoppingBag,
      active: pathname === "/client/orders",
    },
    {
      label: "Tickets",
      href: "/client/tickets",
      icon: Ticket,
      active: pathname === "/client/tickets",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-lg font-semibold">Mon Espace Client</h1>
                  <p className="text-sm text-muted-foreground">
                    Gérez vos commandes et tickets
                  </p>
                </div>
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer la déconnexion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir vous déconnecter ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>
                    Se déconnecter
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-muted/50 p-1 rounded-lg">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  variant={item.active ? "default" : "ghost"}
                  size="sm"
                  onClick={() => router.push(item.href)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
