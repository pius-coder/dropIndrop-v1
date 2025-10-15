/**
 * Drop List Filters Component
 */

"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { DropListFilters } from "../model/types";

interface DropListFiltersProps {
  filters: Partial<DropListFilters>;
  onChange: (filters: Partial<DropListFilters>) => void;
}

export function DropListFilters({ filters, onChange }: DropListFiltersProps) {
  const handleReset = () => {
    onChange({
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <Label htmlFor="search">Rechercher</Label>
        <Input
          id="search"
          placeholder="Nom du drop..."
          value={filters.search || ""}
          onChange={(e) =>
            onChange({ ...filters, search: e.target.value })
          }
          className="text-base md:text-sm"
        />
      </div>

      {/* Status */}
      <div>
        <Label>Statut</Label>
        <Select
          value={filters.status || "all"}
          onValueChange={(value) =>
            onChange({
              ...filters,
              status: value === "all" ? undefined : value as any,
            })
          }
        >
          <SelectTrigger className="text-base md:text-sm">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="DRAFT">Brouillon</SelectItem>
            <SelectItem value="SCHEDULED">Programmé</SelectItem>
            <SelectItem value="SENDING">En cours</SelectItem>
            <SelectItem value="SENT">Envoyé</SelectItem>
            <SelectItem value="FAILED">Échoué</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort */}
      <div>
        <Label>Trier par</Label>
        <div className="grid grid-cols-2 gap-2">
          <Select
            value={filters.sortBy || "createdAt"}
            onValueChange={(value) =>
              onChange({ ...filters, sortBy: value as any })
            }
          >
            <SelectTrigger className="text-base md:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date création</SelectItem>
              <SelectItem value="scheduledFor">Date programmée</SelectItem>
              <SelectItem value="sentAt">Date envoi</SelectItem>
              <SelectItem value="name">Nom</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.sortOrder || "desc"}
            onValueChange={(value) =>
              onChange({ ...filters, sortOrder: value as any })
            }
          >
            <SelectTrigger className="text-base md:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Croissant</SelectItem>
              <SelectItem value="desc">Décroissant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reset */}
      <Button
        variant="outline"
        onClick={handleReset}
        className="w-full"
        size="sm"
      >
        <X className="h-4 w-4 mr-1" />
        Réinitialiser
      </Button>
    </div>
  );
}
