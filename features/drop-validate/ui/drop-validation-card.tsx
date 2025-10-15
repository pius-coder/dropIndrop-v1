/**
 * Drop Validation Card - Compact Version
 * 
 * For use in drop lists or before send actions
 */

"use client";

import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useValidateDrop } from "../lib/use-validate-drop";
import { useState } from "react";
import { DropValidationDisplay } from "./drop-validation-display";

interface DropValidationCardProps {
  dropId: string;
  dropName: string;
}

export function DropValidationCard({ dropId, dropName }: DropValidationCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { data: validation, isLoading, error } = useValidateDrop(dropId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Validation en cours...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm text-red-700">
              Erreur de validation
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!validation) return null;

  return (
    <div className="space-y-3">
      {/* Compact Status */}
      <Card
        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
          validation.canSend ? "border-green-200" : "border-red-200"
        }`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {validation.canSend ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="font-medium text-sm">
                  {validation.canSend ? "✅ Prêt à envoyer" : "🚫 Envoi bloqué"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {validation.summary.clearGroups}/{validation.summary.totalGroups}{" "}
                  groupe(s) OK
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {validation.summary.partiallyBlockedGroups > 0 && (
                <Badge variant="outline" className="text-yellow-600">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validation.summary.partiallyBlockedGroups} partiel
                </Badge>
              )}
              <Button variant="ghost" size="sm">
                {showDetails ? "Masquer" : "Détails"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed View */}
      {showDetails && <DropValidationDisplay validation={validation} />}
    </div>
  );
}
