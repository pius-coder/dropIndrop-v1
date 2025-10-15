/**
 * Order Create Form Component
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useCreateOrder } from "../lib/use-create-order";
import { createOrderSchema, type CreateOrderInput } from "../model/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ShoppingCart } from "lucide-react";

interface OrderCreateFormProps {
  articleId: string;
  articleName: string;
  articlePrice: number;
  onSuccess?: (response: any) => void;
}

export function OrderCreateForm({
  articleId,
  articleName,
  articlePrice,
  onSuccess,
}: OrderCreateFormProps) {
  const { mutate: createOrder, isPending } = useCreateOrder();

  const form = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      articleId,
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      paymentMethod: "MTN_MOMO",
    },
  });

  const onSubmit = (data: CreateOrderInput) => {
    createOrder(data, {
      onSuccess: (response) => {
        toast.success("Commande créée avec succès", {
          description: `Ticket: ${response.ticket.code}`,
        });
        onSuccess?.(response);
      },
      onError: (error: Error) => {
        toast.error("Erreur lors de la commande", {
          description: error.message,
        });
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Passer commande</CardTitle>
        <CardDescription>
          <div className="space-y-1">
            <p className="font-medium">{articleName}</p>
            <p className="text-lg font-bold">
              {articlePrice.toLocaleString("fr-FR")} FCFA
            </p>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Name */}
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Jean Dupont"
                      className="text-base md:text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Customer Phone */}
            <FormField
              control={form.control}
              name="customerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone *</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="6XXXXXXXX"
                      className="text-base md:text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Format: 6XXXXXXXX (Cameroun)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Customer Email */}
            <FormField
              control={form.control}
              name="customerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (optionnel)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="exemple@email.com"
                      className="text-base md:text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Method */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mode de paiement *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="text-base md:text-sm">
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MTN_MOMO">MTN Mobile Money</SelectItem>
                      <SelectItem value="ORANGE_MONEY">Orange Money</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Vous recevrez les instructions de paiement
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Summary */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Article:</span>
                    <span className="font-medium">{articleName}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{articlePrice.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full"
                size="lg"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Commander maintenant
                  </>
                )}
              </Button>
            </div>

            {/* Info */}
            <div className="text-xs text-muted-foreground text-center border-t pt-4">
              <p>
                💡 Après validation, vous recevrez un ticket avec QR code par
                WhatsApp
              </p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
