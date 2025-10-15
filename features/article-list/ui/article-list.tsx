/**
 * Article List Component
 * 
 * Mobile-first grid layout for displaying articles
 */

"use client";

import { useState } from "react";
import { useArticles } from "../lib/use-articles";
import { ArticleCard } from "@/entities/article/ui/article-card";
import { ArticleListFilters } from "./article-list-filters";
import { ArticleListPagination } from "./article-list-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Grid3x3, List } from "lucide-react";
import type { ArticleListFilters as Filters, ArticleViewMode } from "../model/types";

export function ArticleList() {
  const [filters, setFilters] = useState<Partial<Filters>>({});
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ArticleViewMode>("grid");

  const { data, isLoading, error } = useArticles({
    ...filters,
    page,
    limit: 20,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <p className="text-destructive">
            Erreur lors du chargement des articles
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { articles, total, totalPages, hasNextPage, hasPreviousPage } = data || {
    articles: [],
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Articles</h2>
          <p className="text-muted-foreground">
            {total} article{total !== 1 ? "s" : ""} disponible{total !== 1 ? "s" : ""}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
            aria-label="Vue grille"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
            aria-label="Vue liste"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ArticleListFilters filters={filters} onFiltersChange={setFilters} />

      {/* Articles Grid/List */}
      {articles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Aucun article trouvé</p>
            {Object.keys(filters).length > 0 && (
              <Button
                variant="link"
                onClick={() => setFilters({})}
                className="mt-2"
              >
                Réinitialiser les filtres
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} variant="list" />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <ArticleListPagination
          currentPage={page}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
