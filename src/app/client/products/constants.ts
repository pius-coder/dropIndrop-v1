/**
 * Constants for client products page
 * Following clean code principles: meaningful names, DRY, no magic numbers
 */

// Query configuration
export const PRODUCTS_QUERY_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes - named constant instead of magic number
  RETRY_COUNT: 2,
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
} as const;

// UI configuration
export const PRODUCTS_UI_CONFIG = {
  GRID_COLUMNS: {
    SM: 2,
    LG: 3,
    XL: 4,
  },
  ITEMS_PER_PAGE: 12,
} as const;
