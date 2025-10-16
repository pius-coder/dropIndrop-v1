/**
 * Order Success Display Component
 * 
 * Shows ticket and payment instructions after order creation
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Share2 } from "lucide-react";
import type { CreateOrderResponse } from "../model/types";

interface OrderSuccessDisplayProps {
  response: CreateOrderResponse;
  onClose?: () => void;
}

export function OrderSuccessDisplay({ response, onClose }: OrderSuccessDisplayProps) {
  const { order, ticket, paymentInstructions } = response;

  const handleDownloadTicket = () => {
    // Create a link to download QR code
    const link = document.createElement("a");
    link.href = ticket.qrCode;
    link.download = `ticket-${ticket.code}.png`;
    link.click();
  };

  const handleShareTicket = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mon Ticket",
          text: `Ticket: ${ticket.code}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <Card className="border-green-500 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-green-700">
                ✅ Commande créée !
              </h3>
              <p className="text-sm text-green-600">
                Votre ticket a été généré avec succès
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Votre Ticket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* QR Code */}
          <div className="flex justify-center p-6 bg-white rounded-lg border">
            <img
              src={ticket.qrCode}
              alt="QR Code Ticket"
              className="w-48 h-48"
            />
          </div>

          {/* Ticket Code */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Code ticket:</p>
            <p className="text-2xl font-mono font-bold">{ticket.code}</p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleDownloadTicket}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <Button
                variant="outline"
                onClick={handleShareTicket}
                className="w-full"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base text-blue-900">
            💳 Instructions de paiement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-blue-900">
              Mode: {paymentInstructions.method}
            </p>
            <p className="text-lg font-bold text-blue-900">
              Montant: {paymentInstructions.amount.toLocaleString("fr-FR")} FCFA
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="whitespace-pre-wrap text-blue-800">
              {paymentInstructions.instructions}
            </p>
          </div>
          <p className="text-xs text-blue-700">
            ⏱️ Le paiement doit être effectué dans les 24 heures
          </p>
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Détails de la commande</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Numéro:</span>
              <span className="font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Statut paiement:</span>
              <span className="font-medium">{order.paymentStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Statut retrait:</span>
              <span className="font-medium">{order.pickupStatus}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-sm space-y-2">
            <p className="font-medium">📱 Prochaines étapes:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Effectuez le paiement via {paymentInstructions.method}</li>
              <li>Le ticket sera envoyé par WhatsApp après paiement</li>
              <li>Présentez le QR code pour retirer votre commande</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Close Button */}
      {onClose && (
        <Button onClick={onClose} variant="outline" className="w-full">
          Fermer
        </Button>
      )}
    </div>
  );
}
