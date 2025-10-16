/**
 * Article Selector for Drop Creation
 * 
 * Table view with image preview on hover, optimized for multi-select
 */

"use client";

import { useState } from "react";
import { useArticles } from "@/features/article-list/lib/use-articles";
import { formatPrice } from "@/shared/lib";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, X, Image as ImageIcon } from "lucide-react";
import { useDebounce } from "@/shared/lib/use-debounce";

interface ArticleSelectorProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  minSelection?: number;
  maxSelection?: number;
}

export function ArticleSelector({ 
  selectedIds, 
  onSelectionChange,
  minSelection = 3,
  maxSelection = 20 
}: ArticleSelectorProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useArticles({
    search: debouncedSearch || undefined,
    status: "AVAILABLE", // Only show available articles
    page: 1,
    limit: 50,
  });

  const articles = data?.articles || [];
  console.log("ArticleSelector - Articles received:", articles);
  if (articles.length > 0) {
    console.log("First article ID type:", typeof articles[0].id, "value:", articles[0].id);
  }
  const allSelected = selectedIds.length === articles.length && articles.length > 0;
  const canSelectMore = selectedIds.length < maxSelection;

  const toggleArticle = (articleId: unknown) => {
    // Ensure articleId is a string UUID
    const stringId = String(articleId);
    if (selectedIds.includes(stringId)) {
      onSelectionChange(selectedIds.filter(id => id !== stringId));
    } else if (canSelectMore) {
      onSelectionChange([...selectedIds, stringId]);
    }
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      const idsToAdd = articles.slice(0, maxSelection).map(a => String(a.id));
      onSelectionChange(idsToAdd);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            {selectedIds.length} / {maxSelection} articles sélectionnés
          </p>
          {selectedIds.length < minSelection && (
            <p className="text-xs text-destructive">
              Minimum {minSelection} articles requis
            </p>
          )}
          {!canSelectMore && (
            <p className="text-xs text-destructive">
              Limite maximale atteinte
            </p>
          )}
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearch("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : articles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Aucun article trouvé</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                    disabled={!allSelected && !canSelectMore}
                    aria-label="Sélectionner tout"
                  />
                </TableHead>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead className="w-[100px]">Code</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead className="text-right">Prix</TableHead>
                <TableHead className="text-right w-[100px]">Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => {
                const isSelected = selectedIds.includes(article.id);
                const primaryImage = article.images?.[0];

                return (
                  <TableRow 
                    key={article.id}
                    className={isSelected ? "bg-muted/50" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleArticle(article.id)}
                        disabled={!isSelected && !canSelectMore}
                        aria-label={`Sélectionner ${article.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      {primaryImage ? (
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <div className="w-12 h-12 rounded overflow-hidden border bg-gray-100 cursor-pointer hover:border-primary">
                              <img
                                src={primaryImage}
                                alt={article.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent side="right" className="w-80">
                            <div className="space-y-2">
                              <img
                                src={primaryImage}
                                alt={article.name}
                                className="w-full h-48 object-cover rounded"
                              />
                              <div>
                                <h4 className="font-semibold">{article.name}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {article.description}
                                </p>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      ) : (
                        <div className="w-12 h-12 rounded border bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{article.code}</TableCell>
                    <TableCell className="font-medium">{article.name}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatPrice(Number(article.price))}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant={article.stock === 0 ? "destructive" : article.stock <= 10 ? "secondary" : "outline"}
                      >
                        {article.stock}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
