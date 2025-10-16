/**
 * Article List Component
 *
 * Mobile-first grid layout for displaying articles
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useArticles } from "../lib/use-articles";
import { ArticleCard } from "@/entities/article/ui/article-card";
import { ArticleListFilters } from "./article-list-filters";
import { ArticleListPagination } from "./article-list-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Grid3x3, List, Table, Send } from "lucide-react";
import type {
  ArticleListFilters as Filters,
  ArticleViewMode,
} from "../model/types";
import { ArticleTable } from "./article-table";

export function ArticleList() {
  const router = useRouter();
  const [filters, setFilters] = useState<Partial<Filters>>({});
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ArticleViewMode>("table");
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([]);

  const { data, isLoading, error } = useArticles({
    ...filters,
    page,
    limit: 20,
  });

  // Article selection
  const toggleArticleSelection = (articleId: string) => {
    setSelectedArticleIds(prev =>
      prev.includes(articleId)
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const toggleSelectAll = () => {
    if (!data?.articles) return;
    if (selectedArticleIds.length === data.articles.length) {
      setSelectedArticleIds([]);
    } else {
      setSelectedArticleIds(data.articles.map(a => a.id));
    }
  };

  const handleCreateDrop = () => {
    // Navigate to drop creation with pre-selected articles
    const params = new URLSearchParams();
    selectedArticleIds.forEach(id => params.append('articleIds', id));
    router.push(`/admin/drops/new?${params.toString()}`);
  };

  // Article actions
  const handleView = (article: any) => {
    console.log("View article:", article);
    // TODO: Navigate to article detail page
  };

  const handleEdit = (article: any) => {
    console.log("Edit article:", article);
    // TODO: Open edit modal or navigate to edit page
  };

  const handleDelete = (article: any) => {
    console.log("Delete article:", article);
    // TODO: Show confirmation dialog and delete
  };

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
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  const { articles, total, totalPages, hasNextPage, hasPreviousPage } =
    data || {
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
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Articles</h2>
            <p className="text-muted-foreground">
              {total} article{total !== 1 ? "s" : ""} disponible{total !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Selected Count & Create Drop */}
          {selectedArticleIds.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {selectedArticleIds.length} sélectionné{selectedArticleIds.length !== 1 ? "s" : ""}
              </Badge>
              <Button size="sm" onClick={handleCreateDrop}>
                <Send className="h-4 w-4 mr-2" />
                Créer un Drop
              </Button>
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("table")}
            aria-label="Vue tableau"
          >
            <Table className="h-4 w-4" />
          </Button>
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

      {/* Articles Grid/List/Table */}
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
      ) : viewMode === "table" ? (
        <ArticleTable
          articles={articles}
          selectedIds={selectedArticleIds}
          onToggleSelection={toggleArticleSelection}
          onToggleSelectAll={toggleSelectAll}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              selected={selectedArticleIds.includes(article.id)}
              onToggleSelection={() => toggleArticleSelection(article.id)}
              onClick={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              showActions
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              variant="list"
              selected={selectedArticleIds.includes(article.id)}
              onToggleSelection={() => toggleArticleSelection(article.id)}
              onClick={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              showActions
            />
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
