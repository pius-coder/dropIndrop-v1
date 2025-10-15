/**
 * Article List Filters Component
 * 
 * Filter controls for article listing
 */

"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useDebounce } from "@/shared/lib/use-debounce";
import type { ArticleListFilters as Filters } from "../model/types";

interface ArticleListFiltersProps {
  filters: Partial<Filters>;
  onFiltersChange: (filters: Partial<Filters>) => void;
}

export function ArticleListFilters({
  filters,
  onFiltersChange,
}: ArticleListFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ ...filters, search: debouncedSearch || undefined });
    }
  }, [debouncedSearch]);

  const hasActiveFilters = Object.keys(filters).length > 0;

  const handleClearFilters = () => {
    setSearchInput("");
    onFiltersChange({});
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un article..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10 text-base md:text-sm"
        />
        {searchInput && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setSearchInput("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-2">
        {/* Status Filter */}
        <Select
          value={filters.status || "all"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              status: value === "all" ? undefined : (value as Filters["status"]),
            })
          }
        >
          <SelectTrigger className="w-[150px] text-base md:text-sm">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="ACTIVE">Actif</SelectItem>
            <SelectItem value="INACTIVE">Inactif</SelectItem>
            <SelectItem value="OUT_OF_STOCK">Rupture</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select
          value={filters.sortBy || "createdAt"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              sortBy: value as Filters["sortBy"],
            })
          }
        >
          <SelectTrigger className="w-[150px] text-base md:text-sm">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Plus récent</SelectItem>
            <SelectItem value="name">Nom</SelectItem>
            <SelectItem value="price">Prix</SelectItem>
            <SelectItem value="stock">Stock</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select
          value={filters.sortOrder || "desc"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              sortOrder: value as Filters["sortOrder"],
            })
          }
        >
          <SelectTrigger className="w-[130px] text-base md:text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Croissant</SelectItem>
            <SelectItem value="desc">Décroissant</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="ml-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Effacer
          </Button>
        )}
      </div>
    </div>
  );
}
