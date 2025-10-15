/**
 * Edit Article Page Component
 */

"use client";

import { ArticleUpdateForm } from "@/features/article-update";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EditArticlePageProps {
  articleId: string;
}

export function EditArticlePage({ articleId }: EditArticlePageProps) {
  const router = useRouter();

  if (!articleId) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <p className="text-destructive">ID d'article manquant</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Modifier l'article</h1>
          <p className="text-muted-foreground">Mettre à jour les informations du produit</p>
        </div>
      </div>

      {/* Update Form */}
      <ArticleUpdateForm articleId={articleId} />
    </div>
  );
}
