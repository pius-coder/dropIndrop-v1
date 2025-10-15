/**
 * Admin Articles Page Component
 * 
 * Integrates all article features:
 * - article-list
 * - article-create
 * - article-update
 * - article-delete
 * - article-stock
 */

"use client";

import { useState } from "react";
import { ArticleList } from "@/features/article-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function ArticlesPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Articles</h1>
          <p className="text-muted-foreground">Gérer votre catalogue de produits</p>
        </div>
        <Button onClick={() => router.push("/admin/articles/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel article
        </Button>
      </div>

      {/* Article List with all features */}
      <ArticleList />
    </div>
  );
}
