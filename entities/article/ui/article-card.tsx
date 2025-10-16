/**
 * ArticleCard Component
 * 
 * Mobile-first display component for Article entity
 */

"use client";

import { formatPrice } from "@/shared/lib";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getStockStatusText,
  getPrimaryImage,
  isLowStock,
  isOutOfStock,
} from "../lib/article-utils";
import type { Article } from "../model/types";

interface ArticleCardProps {
  article: Article;
  variant?: "grid" | "list";
  selected?: boolean;
  onToggleSelection?: () => void;
  onClick?: (article: Article) => void;
  onEdit?: (article: Article) => void;
  onDelete?: (article: Article) => void;
  showActions?: boolean;
}

export function ArticleCard({
  article,
  variant = "grid",
  selected = false,
  onToggleSelection,
  onClick,
  onEdit,
  onDelete,
  showActions = false,
}: ArticleCardProps) {
  const primaryImage = getPrimaryImage(article);
  const lowStock = isLowStock(article);
  const outOfStock = isOutOfStock(article);
  const hasSelection = !!onToggleSelection;

  // List variant - horizontal layout
  if (variant === "list") {
    return (
      <div
        className={`group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md flex ${
          selected ? "ring-2 ring-primary" : ""
        }`}
        onClick={() => onClick?.(article)}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {/* Checkbox - List view */}
        {hasSelection && (
          <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={selected}
              onCheckedChange={onToggleSelection}
              className="bg-white"
            />
          </div>
        )}
        
        {/* Image - Fixed width for list view */}
        <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden bg-gray-100">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={article.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-gray-400 text-xs">Pas d'image</span>
            </div>
          )}

          {/* Status Badge */}
          {article.status === "ARCHIVED" && (
            <div className="absolute top-2 left-2 rounded-full bg-gray-500 px-2 py-1 text-xs font-semibold text-white">
              Archivé
            </div>
          )}
        </div>

        {/* Content - Flex layout for list */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 line-clamp-1">
                  {article.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{article.code}</p>
              </div>
              
              {/* Stock Badge - Top right for list view */}
              {(lowStock || outOfStock) && (
                <div
                  className={`rounded-full px-2 py-1 text-xs font-semibold flex-shrink-0 ${
                    outOfStock
                      ? "bg-red-500 text-white"
                      : "bg-yellow-500 text-white"
                  }`}
                >
                  {getStockStatusText(article)}
                </div>
              )}
            </div>

            <p className="text-lg font-bold text-gray-900 mt-2">
              {formatPrice(Number(article.price))}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">
              Stock: <span className="font-semibold">{article.stock}</span>
            </span>
            {article.views > 0 && (
              <span className="text-gray-500">{article.views} vues</span>
            )}
          </div>

          {/* Actions for list view */}
          {showActions && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.(article);
                }}
                className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Voir
              </button>

              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(article);
                  }}
                  className="rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Modifier
                </button>
              )}

              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(article);
                  }}
                  className="rounded border border-red-300 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  Supprimer
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Grid variant - vertical layout (default)
  return (
    <div
      className={`group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md ${
        selected ? "ring-2 ring-primary" : ""
      }`}
      onClick={() => onClick?.(article)}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Checkbox - Grid view */}
      {hasSelection && (
        <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selected}
            onCheckedChange={onToggleSelection}
            className="bg-white"
          />
        </div>
      )}
      
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={article.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-gray-400">Pas d'image</span>
          </div>
        )}

        {/* Stock Badge */}
        {(lowStock || outOfStock) && (
          <div
            className={`absolute top-2 right-2 rounded-full px-2 py-1 text-xs font-semibold ${
              outOfStock
                ? "bg-red-500 text-white"
                : "bg-yellow-500 text-white"
            }`}
          >
            {getStockStatusText(article)}
          </div>
        )}

        {/* Status Badge */}
        {article.status === "ARCHIVED" && (
          <div className="absolute top-2 left-2 rounded-full bg-gray-500 px-2 py-1 text-xs font-semibold text-white">
            Archivé
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name */}
        <h3 className="mb-1 line-clamp-2 font-semibold text-gray-900">
          {article.name}
        </h3>

        {/* Code */}
        <p className="mb-2 text-xs text-gray-500">{article.code}</p>

        {/* Price */}
        <p className="mb-2 text-lg font-bold text-gray-900">
          {formatPrice(Number(article.price))}
        </p>

        {/* Stock Info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Stock: <span className="font-semibold">{article.stock}</span>
          </span>
          {article.views > 0 && (
            <span className="text-gray-500">{article.views} vues</span>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick?.(article);
              }}
              className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Voir
            </button>

            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(article);
                }}
                className="rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Modifier
              </button>
            )}

            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(article);
                }}
                className="rounded border border-red-300 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                Supprimer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
