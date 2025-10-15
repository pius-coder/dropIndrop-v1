/**
 * New Article Page Component
 */

"use client";

import { ArticleCreateForm } from "@/features/article-create";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function NewArticlePage() {
  const router = useRouter();

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
          <h1 className="text-3xl font-bold">Nouvel article</h1>
          <p className="text-muted-foreground">Ajouter un nouveau produit au catalogue</p>
        </div>
      </div>

      {/* Create Form */}
      <ArticleCreateForm />
    </div>
  );
}
