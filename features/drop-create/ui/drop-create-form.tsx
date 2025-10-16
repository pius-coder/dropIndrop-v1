/**
 * Drop Create Form Component
 */

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useCreateDrop } from "../lib/use-create-drop";
import { createDropSchema, type CreateDropInput } from "../model/types";
import { ArticleSelector } from "./article-selector";
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
import { Loader2 } from "lucide-react";

export function DropCreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: createDrop, isPending } = useCreateDrop();

  const form = useForm<CreateDropInput>({
    resolver: zodResolver(createDropSchema),
    defaultValues: {
      name: "",
      articleIds: [],
      groupIds: [],
    },
  });

  // Load pre-selected articles from URL
  useEffect(() => {
    const articleIds = searchParams.getAll('articleIds');
    if (articleIds.length > 0) {
      form.setValue('articleIds', articleIds);
      toast.success(`${articleIds.length} article(s) pré-sélectionné(s)`, {
        description: "Vous pouvez modifier votre sélection ci-dessous",
      });
    }
  }, [searchParams, form]);

  const onSubmit = (data: CreateDropInput) => {
    createDrop(data, {
      onSuccess: (drop) => {
        toast.success("Drop créé avec succès", {
          description: `${drop.name} est prêt à être envoyé`,
        });
        router.push("/admin/drops");
      },
      onError: (error: Error) => {
        toast.error("Erreur lors de la création", {
          description: error.message,
        });
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouveau Drop</CardTitle>
        <CardDescription>
          Créer une campagne marketing pour envoyer des articles aux groupes WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du Drop *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Promotion iPhone 15"
                      className="text-base md:text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Nom identifiant la campagne
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Article Selection */}
            <FormField
              control={form.control}
              name="articleIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Articles à envoyer *</FormLabel>
                  <FormDescription>
                    Sélectionnez 1 à 20 articles pour ce drop
                  </FormDescription>
                  <FormControl>
                    <ArticleSelector
                      selectedIds={field.value}
                      onSelectionChange={field.onChange}
                      maxSelection={20}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Group Selection - Simplified for now */}
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                ℹ️ Sélection de groupes: À implémenter avec un composant multi-select
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Pour l'instant, utilisez l'API directement avec groupIds: ["id1", "id2"]
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
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
                    Création...
                  </>
                ) : (
                  "Créer le Drop"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
