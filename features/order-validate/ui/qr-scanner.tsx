/**
 * QR Scanner Component
 * 
 * Placeholder for QR code scanner (requires camera access)
 * For now, shows manual entry option
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, FileText } from "lucide-react";

interface QRScannerProps {
  onSwitchToManual: () => void;
}

export function QRScanner({ onSwitchToManual }: QRScannerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scanner QR Code</CardTitle>
        <CardDescription>
          Scannez le QR code du ticket client
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Placeholder for camera view */}
        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center space-y-3">
            <Camera className="h-16 w-16 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Scanner QR code
            </p>
            <p className="text-xs text-muted-foreground">
              (Fonctionnalité à implémenter)
            </p>
          </div>
        </div>

        {/* Manual Entry Option */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-center mb-3">
              Le scanner ne fonctionne pas ?
            </p>
            <Button
              variant="outline"
              onClick={onSwitchToManual}
              className="w-full"
            >
              <FileText className="mr-2 h-4 w-4" />
              Entrer le code manuellement
            </Button>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 Pour utiliser le scanner:</p>
          <ul className="list-disc list-inside pl-2">
            <li>Autoriser l'accès à la caméra</li>
            <li>Pointer vers le QR code du ticket</li>
            <li>Le scan sera automatique</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
