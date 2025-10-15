/**
 * Drop List Component
 */

"use client";

import { useState } from "react";
import { useDrops } from "../lib/use-drops";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, Send, Trash2, Calendar } from "lucide-react";
import { getDropStatusText, getDropStatusColor } from "@/entities/drop";
import { formatDate } from "@/shared/lib";
import type { DropListFilters } from "../model/types";
import type { Drop } from "@/entities/drop";

interface DropListProps {
  onView?: (drop: Drop) => void;
  onSend?: (drop: Drop) => void;
  onDelete?: (drop: Drop) => void;
}

export function DropList({ onView, onSend, onDelete }: DropListProps) {
  const [filters, setFilters] = useState<Partial<DropListFilters>>({
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data, isLoading, error } = useDrops(filters);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <p className="text-destructive">Erreur lors du chargement</p>
        </CardContent>
      </Card>
    );
  }

  const { drops = [], total = 0 } = data || {};

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Drops</h2>
          <p className="text-muted-foreground">{total} campagne(s)</p>
        </div>
      </div>

      {/* List */}
      {drops.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Aucun drop</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {drops.map((drop) => (
            <Card key={drop.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold">{drop.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge className={getDropStatusColor(drop.status)}>
                          {getDropStatusText(drop.status)}
                        </Badge>
                        {drop.scheduledFor && (
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(drop.scheduledFor)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Articles:</span>
                      <span className="ml-2 font-medium">
                        {drop.totalArticlesSent || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Groupes:</span>
                      <span className="ml-2 font-medium">
                        {drop.totalGroupsSent || 0}
                      </span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="text-xs text-muted-foreground">
                    {drop.sentAt ? (
                      <span>Envoyé le {formatDate(drop.sentAt)}</span>
                    ) : (
                      <span>Créé le {formatDate(drop.createdAt)}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onView?.(drop)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    {(drop.status === "DRAFT" || drop.status === "SCHEDULED") && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => onSend?.(drop)}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Envoyer
                      </Button>
                    )}
                    {drop.status === "DRAFT" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete?.(drop)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
