import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorProductsStateProps {
  error: string;
  onRetry: () => void;
}

/**
 * Error state component when products loading fails
 */
export default function ErrorProductsState({
  error,
  onRetry,
}: ErrorProductsStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <div>
              <h2 className="text-lg font-semibold">Erreur</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <Button onClick={onRetry} variant="outline">
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
