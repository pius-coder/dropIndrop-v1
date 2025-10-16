/**
 * Order Success View Component
 * Shows order confirmation and ticket details
 */

"use client";

import { formatPrice } from "@/shared/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Download, Share2, Home, QrCode } from "lucide-react";

interface OrderSuccessData {
  order: any;
  article: any;
}

interface OrderSuccessViewProps {
  data: OrderSuccessData;
}

export function OrderSuccessView({ data }: OrderSuccessViewProps) {
  const { order, article } = data;

  const handleDownloadTicket = () => {
    // In production, this would generate and download a PDF
    alert("Téléchargement du ticket (fonctionnalité à implémenter)");
  };

  const handleShareTicket = () => {
    const ticketUrl = `${window.location.origin}/ticket/${order.ticketCode}`;
    const message = `🎫 Mon ticket Drop-In-Drop\n\nArticle: ${article.name}\nCode: ${order.ticketCode}\n\nVoir le ticket: ${ticketUrl}`;

    if (navigator.share) {
      navigator.share({
        title: "Mon ticket Drop-In-Drop",
        text: message,
        url: ticketUrl,
      });
    } else {
      navigator.clipboard.writeText(message);
      alert("Informations du ticket copiées!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Commande réussie!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Details */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Numéro de commande:</span>
                <span className="font-medium">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Article:</span>
                <span className="font-medium">{article.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Montant:</span>
                <span className="font-medium">{formatPrice(Number(order.amount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Statut:</span>
                <Badge variant="default">{order.paymentStatus}</Badge>
              </div>
            </div>

            {/* Ticket Info */}
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-blue-900">Votre ticket</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-700">Code ticket:</span>
                  <span className="font-mono font-medium text-blue-900">
                    {order.ticketCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Valide jusqu'au:</span>
                  <span className="font-medium text-blue-900">
                    {new Date(order.ticketExpiresAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
              <div className="bg-white rounded p-2 text-center">
                <QrCode className="h-12 w-12 mx-auto text-gray-400" />
                <p className="text-xs text-gray-500 mt-1">Présentez ce QR code</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={handleDownloadTicket}
              >
                <Download className="mr-2 h-4 w-4" />
                Télécharger le ticket
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleShareTicket}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Partager le ticket
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = "/"}
              >
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Button>
            </div>

            {/* Instructions */}
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p className="font-medium">📋 Prochaines étapes:</p>
              <ol className="list-decimal list-inside space-y-1 text-left">
                <li>Présentez ce ticket à notre point de vente</li>
                <li>Montrez le QR code ou le code ticket</li>
                <li>Récupérez votre article</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
