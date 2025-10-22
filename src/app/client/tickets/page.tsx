"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Ticket,
  QrCode,
  AlertCircle,
  ArrowLeft,
  Eye,
  Calendar,
  CheckCircle,
} from "lucide-react";

// Types for client data
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

interface ClientData {
  id: string;
  username: string;
  phoneNumber: string;
  orders: any[];
  tickets: ClientTicket[];
}

/**
 * Client tickets page
 */
export default function ClientTicketsPage() {
  const router = useRouter();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<ClientTicket | null>(
    null
  );
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

        <div className="grid gap-4">
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
            <h1 className="text-2xl font-bold">Mes tickets de livraison</h1>
            <p className="text-muted-foreground">
              Utilisez ces codes pour récupérer vos commandes
            </p>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {clientData.tickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun ticket</h3>
            <p className="text-muted-foreground text-center">
              Vous n'avez encore aucun ticket de livraison.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {clientData.tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Ticket className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-base">
                        {ticket.order.product.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Ticket #{ticket.uniqueCode}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {ticket.isUsed ? (
                      <Badge variant="secondary">Utilisé</Badge>
                    ) : (
                      <Badge variant="default">Valide</Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Voir QR
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Commande #{ticket.order.orderNumber}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(ticket.order.totalAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Créé le {formatDate(ticket.createdAt)}
                    </span>
                    {ticket.expiresAt && (
                      <span className="text-muted-foreground">
                        Expire le {formatDate(ticket.expiresAt)}
                      </span>
                    )}
                  </div>
                  {ticket.isUsed && (
                    <p className="text-sm text-primary">
                      Utilisé le {formatDate(ticket.createdAt)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QR Code Dialog */}
      <Dialog
        open={!!selectedTicket}
        onOpenChange={() => setSelectedTicket(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5" />
              <span>Code QR de livraison</span>
            </DialogTitle>
            <DialogDescription>
              Présentez ce code QR au gestionnaire de livraison
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg border text-center">
                <QrCode className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  QR Code #{selectedTicket.uniqueCode}
                </p>
                <p className="font-mono text-lg font-bold">
                  {selectedTicket.uniqueCode}
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTicket(null)}
                  className="flex-1"
                >
                  Fermer
                </Button>
                <Button
                  onClick={() => {
                    // Copy the unique code to clipboard for manual use
                    navigator.clipboard.writeText(selectedTicket.uniqueCode);
                    alert("Code copié dans le presse-papiers!");
                  }}
                  className="flex-1"
                >
                  Copier le code
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
