/**
 * Stock Adjustment Dialog Component
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAdjustStock } from "../lib/use-adjust-stock";
import { stockAdjustmentSchema, type StockAdjustment } from "../model/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Package } from "lucide-react";
import type { Article } from "@/entities/article";

interface StockAdjustmentDialogProps {
  article: Article;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function StockAdjustmentDialog({
  article,
  onSuccess,
  trigger,
}: StockAdjustmentDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate: adjustStock, isPending } = useAdjustStock(article.id);

  const form = useForm<StockAdjustment>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      type: "ADD",
      quantity: 0,
      reason: "",
    },
  });

  const onSubmit = (data: StockAdjustment) => {
    adjustStock(data, {
      onSuccess: (updatedArticle) => {
        const typeLabel =
          data.type === "ADD"
            ? "ajouté"
            : data.type === "REMOVE"
            ? "retiré"
            : "défini";

        toast.success("Stock mis à jour", {
          description: `${data.quantity} unités ${typeLabel}. Nouveau stock: ${updatedArticle.stock}`,
        });

        setOpen(false);
        form.reset();
        onSuccess?.();
      },
      onError: (error: Error) => {
        toast.error("Erreur lors de l'ajustement", {
          description: error.message,
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Package className="h-4 w-4 mr-2" />
            Ajuster Stock
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajuster le Stock</DialogTitle>
          <DialogDescription>
            Modifier le stock de {article.name}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <span className="text-sm text-muted-foreground">Stock actuel:</span>
            <span className="text-lg font-semibold">{article.stock} unités</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type d'ajustement *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-base md:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADD">Ajouter au stock</SelectItem>
                      <SelectItem value="REMOVE">Retirer du stock</SelectItem>
                      <SelectItem value="SET">Définir le stock</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantity */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantité *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="10"
                      className="text-base md:text-sm"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raison (optionnel)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Réapprovisionnement, inventaire..."
                      className="text-base md:text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ajustement...
                  </>
                ) : (
                  "Confirmer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
