/**
 * Article Delete Dialog Component
 * 
 * Confirmation dialog for deleting articles
 */

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useDeleteArticle } from "../lib/use-delete-article";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import type { Article } from "@/entities/article";

interface ArticleDeleteDialogProps {
  article: Article;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function ArticleDeleteDialog({
  article,
  onSuccess,
  trigger,
}: ArticleDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate: deleteArticle, isPending } = useDeleteArticle();

  const handleDelete = () => {
    deleteArticle(article.id, {
      onSuccess: () => {
        toast.success("Article supprimé", {
          description: `${article.name} a été supprimé du catalogue`,
        });
        setOpen(false);
        onSuccess?.();
      },
      onError: (error: Error) => {
        toast.error("Erreur lors de la suppression", {
          description: error.message,
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer cet article ? Cette action est
            irréversible.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="font-medium">{article.name}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Prix: {Number(article.price).toLocaleString("fr-FR")} FCFA
            </p>
            <p className="text-sm text-muted-foreground">
              Stock: {article.stock} unités
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
