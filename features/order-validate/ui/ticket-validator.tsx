/**
 * Ticket Validator Component
 *
 * Manual ticket code entry with validation
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, CheckCircle2, XCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { useValidateTicket, useMarkPickedUp } from "../lib/use-validate-ticket";
import { validateTicketSchema, type ValidateTicketInput } from "../model/types";
import type { ValidateTicketResponse } from "../model/types";

export function TicketValidator() {
  const [validationResult, setValidationResult] =
    useState<ValidateTicketResponse | null>(null);
  const { mutate: validate, isPending: isValidating } = useValidateTicket();
  const { mutate: markPickedUp, isPending: isMarking } = useMarkPickedUp();

  const form = useForm<ValidateTicketInput>({
    resolver: zodResolver(validateTicketSchema),
    defaultValues: {
      ticketCode: "",
    },
  });

  const onSubmit = (data: ValidateTicketInput) => {
    validate(data, {
      onSuccess: (result) => {
        setValidationResult(result);
        if (result.valid) {
          toast.success("Ticket valide", {
            description: result.message,
          });
        } else {
          toast.error("Ticket invalide", {
            description: result.message,
          });
        }
      },
      onError: (error: Error) => {
        toast.error("Erreur de validation", {
          description: error.message,
        });
      },
    });
  };

  const handleMarkPickedUp = () => {
    if (!validationResult?.order) return;

    markPickedUp(validationResult.order.id, {
      onSuccess: () => {
        toast.success("Commande retirée", {
          description: "Le stock a été mis à jour",
        });
        form.reset();
        setValidationResult(null);
      },
      onError: (error: Error) => {
        toast.error("Erreur", {
          description: error.message,
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Validation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Valider un ticket</CardTitle>
          <CardDescription>
            Entrez le code ticket pour valider une commande
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="ticketCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code Ticket</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="TKT-20251015-0001"
                        className="text-base md:text-sm font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isValidating}
                className="w-full"
                size="lg"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validation...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Valider le ticket
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Validation Result */}
      {validationResult && (
        <>
          {validationResult.valid && validationResult.order ? (
            <Card className="border-green-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  <div className="flex-1">
                    <CardTitle className="text-green-700">
                      ✅ Ticket Valide
                    </CardTitle>
                    <CardDescription>
                      {validationResult.message}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Details */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">Commande</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Numéro:</span>
                        <span className="font-medium">
                          {validationResult.order.orderNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ticket:</span>
                        <span className="font-mono text-xs">
                          {validationResult.order.ticketCode}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Client</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nom:</span>
                        <span className="font-medium">
                          {validationResult.order.customer.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Téléphone:
                        </span>
                        <span className="font-medium">
                          {validationResult.order.customer.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Article</h4>
                    <div className="flex gap-3">
                      {validationResult.order.article.images[0] && (
                        <img
                          src={validationResult.order.article.images[0]}
                          alt={validationResult.order.article.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">
                          {validationResult.order.article.name}
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {validationResult.order.totalPrice.toLocaleString(
                            "fr-FR",
                          )}{" "}
                          FCFA
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Statuts</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={
                          validationResult.order.paymentStatus === "PAID"
                            ? "default"
                            : "secondary"
                        }
                      >
                        Paiement: {validationResult.order.paymentStatus}
                      </Badge>
                      <Badge
                        variant={
                          validationResult.order.pickupStatus === "PICKED_UP"
                            ? "default"
                            : "outline"
                        }
                      >
                        Retrait: {validationResult.order.pickupStatus}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {validationResult.canPickup && (
                  <Button
                    onClick={handleMarkPickedUp}
                    disabled={isMarking}
                    className="w-full"
                    size="lg"
                  >
                    {isMarking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Validation...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Marquer comme retiré
                      </>
                    )}
                  </Button>
                )}

                {!validationResult.canPickup && (
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="pt-6">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Cette commande ne peut pas être retirée.
                        {validationResult.order.paymentStatus !== "PAID" &&
                          " Paiement non confirmé."}
                        {validationResult.order.pickupStatus === "PICKED_UP" &&
                          " Déjà retirée."}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-red-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <XCircle className="h-6 w-6 text-red-500" />
                  <div>
                    <h4 className="font-semibold text-red-700">
                      ❌ Ticket Invalide
                    </h4>
                    <p className="text-sm text-red-600">
                      {validationResult.message}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
