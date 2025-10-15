/**
 * Validate Ticket Page Component
 */

"use client";

import { useState } from "react";
import { TicketValidator, QRScanner } from "@/features/order-validate";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ValidateTicketPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"scanner" | "manual">("manual");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Valider un ticket</h1>
          <p className="text-muted-foreground">
            Scanner ou entrer le code ticket pour validation
          </p>
        </div>
      </div>

      {/* Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mode de validation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={mode === "manual" ? "default" : "outline"}
              onClick={() => setMode("manual")}
              className="w-full"
            >
              <FileText className="mr-2 h-4 w-4" />
              Saisie manuelle
            </Button>
            <Button
              variant={mode === "scanner" ? "default" : "outline"}
              onClick={() => setMode("scanner")}
              className="w-full"
            >
              <Camera className="mr-2 h-4 w-4" />
              Scanner QR
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Validation Interface */}
      {mode === "manual" ? (
        <TicketValidator />
      ) : (
        <QRScanner onSwitchToManual={() => setMode("manual")} />
      )}
    </div>
  );
}
