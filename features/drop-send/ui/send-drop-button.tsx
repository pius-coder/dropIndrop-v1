/**
 * Send Drop Button Component
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useSendDrop } from "../lib/use-send-drop";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropValidationDisplay } from "@/features/drop-validate";

interface SendDropButtonProps {
  dropId: string;
  dropName: string;
  onSuccess?: () => void;
}

export function SendDropButton({ dropId, dropName, onSuccess }: SendDropButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const { send, isLoading, canSend, validation } = useSendDrop(dropId);

  const handleSend = (force: boolean = false) => {
    send(force, {
      onSuccess: (result) => {
        toast.success("Drop envoyé avec succès", {
          description: `${result.statistics.totalMessages} message(s) envoyé(s)`,
        });
        setShowConfirm(false);
        onSuccess?.();
      },
      onError: (error: Error) => {
        toast.error("Erreur lors de l'envoi", {
          description: error.message,
        });
      },
    });
  };

  const handleClick = () => {
    if (!canSend) {
      toast.error("Envoi bloqué", {
        description: "Tous les articles ont déjà été envoyés aujourd'hui",
      });
      return;
    }
    setShowConfirm(true);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isLoading || !canSend}
        size="lg"
        className="w-full sm:w-auto"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Envoyer le Drop
          </>
        )}
      </Button>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirmer l'envoi</DialogTitle>
            <DialogDescription>
              Vous allez envoyer <strong>{dropName}</strong> aux groupes WhatsApp
            </DialogDescription>
          </DialogHeader>

          {validation && (
            <div className="py-4">
              <DropValidationDisplay validation={validation} showDetails={true} />
            </div>
          )}

          {!canSend && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">⚠️ Avertissement</p>
                  <p>
                    Certains articles ne peuvent pas être envoyés aujourd'hui.
                    Vous pouvez forcer l'envoi mais cela peut être considéré comme
                    du spam.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            {!canSend && (
              <Button
                variant="destructive"
                onClick={() => handleSend(true)}
                disabled={isLoading}
              >
                Forcer l'envoi
              </Button>
            )}
            {canSend && (
              <Button onClick={() => handleSend(false)} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Confirmer
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
