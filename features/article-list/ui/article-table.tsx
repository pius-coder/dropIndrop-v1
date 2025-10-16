/**
 * Article Table Component
 * 
 * Table view for articles with sortable columns
 */

"use client";

import { formatPrice } from "@/shared/lib";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import type { Article } from "@/entities/article";

interface ArticleTableProps {
  articles: Article[];
  selectedIds?: string[];
  onToggleSelection?: (id: string) => void;
  onToggleSelectAll?: () => void;
  onView?: (article: Article) => void;
  onEdit?: (article: Article) => void;
  onDelete?: (article: Article) => void;
}

export function ArticleTable({ 
  articles, 
  selectedIds = [],
  onToggleSelection,
  onToggleSelectAll,
  onView, 
  onEdit, 
  onDelete 
}: ArticleTableProps) {
  const hasActions = onView || onEdit || onDelete;
  const hasSelection = !!onToggleSelection;
  const allSelected = hasSelection && selectedIds.length === articles.length && articles.length > 0;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {hasSelection && (
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onToggleSelectAll}
                  aria-label="Sélectionner tout"
                />
              </TableHead>
            )}
            <TableHead className="w-[100px]">Code</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead className="text-right">Prix</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Vues</TableHead>
            {hasActions && <TableHead className="w-[50px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <TableRow key={article.id}>
              {hasSelection && (
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(article.id)}
                    onCheckedChange={() => onToggleSelection?.(article.id)}
                    aria-label={`Sélectionner ${article.name}`}
                  />
                </TableCell>
              )}
              <TableCell className="font-mono text-xs">{article.code}</TableCell>
              <TableCell className="font-medium">{article.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                -
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatPrice(Number(article.price))}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant={article.stock === 0 ? "destructive" : article.stock <= 10 ? "secondary" : "outline"}>
                  {article.stock}
                </Badge>
              </TableCell>
              <TableCell>
                {article.status === "AVAILABLE" && (
                  <Badge variant="default">Disponible</Badge>
                )}
                {article.status === "OUT_OF_STOCK" && (
                  <Badge variant="destructive">Rupture</Badge>
                )}
                {article.status === "ARCHIVED" && (
                  <Badge variant="secondary">Archivé</Badge>
                )}
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {article.views}
              </TableCell>
              {hasActions && (
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(article)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(article)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem 
                          onClick={() => onDelete(article)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
