/**
 * Article Stock Feature - Public API
 */

export { StockAdjustmentDialog } from "./ui/stock-adjustment-dialog";
export { useAdjustStock } from "./lib/use-adjust-stock";
export { adjustStock } from "./api/article-stock-api";
export { stockAdjustmentSchema } from "./model/types";
export type { StockAdjustment, StockAdjustmentType } from "./model/types";
