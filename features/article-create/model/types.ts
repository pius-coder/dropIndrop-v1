/**
 * Article Create - Types
 * 
 * Reuses createArticleSchema from entity layer
 */

import { createArticleSchema, type CreateArticleInput } from "@/entities/article";

// Re-export from entity layer
export { createArticleSchema };
export type { CreateArticleInput };

/**
 * Form state
 */
export interface ArticleCreateFormState {
  isSubmitting: boolean;
  error: string | null;
}
