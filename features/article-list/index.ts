/**
 * Article List Feature - Public API
 */

// UI Components
export { ArticleList } from "./ui/article-list";
export { ArticleListFilters } from "./ui/article-list-filters";
export { ArticleListPagination } from "./ui/article-list-pagination";

// Hooks
export { useArticles, useArticleSearch, useArticlesByCategory } from "./lib/use-articles";

// API
export { getArticles, searchArticles, getArticlesByCategory } from "./api/article-list-api";

// Types
export type {
  ArticleListFilters as ArticleListFiltersType,
  ArticleListQuery,
  ArticleListResponse,
  ArticleViewMode,
  PaginationParams,
} from "./model/types";
