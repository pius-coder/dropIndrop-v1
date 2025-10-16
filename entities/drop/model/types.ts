/**
 * Drop Entity - Types & Schema
 *
 * Critical business rule: Same article cannot be sent to same group on same day
 */

import { z } from "zod";
import type {
  Drop as PrismaDrop,
  DropStatus as PrismaDropStatus,
} from "@prisma/client";

/**
 * Drop Status Enum
 */
export const DropStatusEnum = z.enum([
  "DRAFT",
  "SCHEDULED",
  "SENDING",
  "SENT",
  "FAILED",
]);
export type DropStatus = z.infer<typeof DropStatusEnum>;

/**
 * Create Drop Input Schema
 */
export const createDropSchema = z.object({
  name: z
    .string()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),

  articleIds: z
    .array(z.string().uuid())
    .min(1, "Au moins un article est requis")
    .max(20, "Maximum 20 articles par drop"),

  whatsappGroupIds: z
    .array(z.string().uuid())
    .min(0, "Groupes WhatsApp (en développement)")
    .max(10, "Maximum 10 groupes par envoi")
    .default([]),

  messageTemplateId: z.string().uuid().optional(),

  scheduledFor: z
    .date()
    .optional()
    .refine(
      (date) => {
        if (!date) return true;
        return date.getTime() > Date.now();
      },
      {
        message: "La date programmée doit être dans le futur",
      }
    ),
});

/**
 * Update Drop Schema
 */
export const updateDropSchema = createDropSchema.partial().extend({
  status: DropStatusEnum.optional(),
});

/**
 * Drop Filter Schema
 */
export const dropFilterSchema = z.object({
  status: DropStatusEnum.optional(),
  createdBy: z.string().uuid().optional(),
  scheduledAfter: z.date().optional(),
  scheduledBefore: z.date().optional(),
  search: z.string().optional(),
});

/**
 * Same-Day Validation Result
 */
export const sameDayValidationSchema = z.object({
  groupId: z.string().uuid(),
  groupName: z.string(),
  allowedArticleIds: z.array(z.string().uuid()),
  blockedArticleIds: z.array(z.string().uuid()),
  warnings: z.array(z.string()),
});

/**
 * Drop Validation Result
 */
export const dropValidationSchema = z.object({
  canSend: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  groupValidations: z.array(sameDayValidationSchema),
});

/**
 * TypeScript Types
 */
export type CreateDropInput = z.infer<typeof createDropSchema>;
export type UpdateDropInput = z.infer<typeof updateDropSchema>;
export type DropFilter = z.infer<typeof dropFilterSchema>;
export type SameDayValidation = z.infer<typeof sameDayValidationSchema>;
export type DropValidation = z.infer<typeof dropValidationSchema>;

/**
 * Drop type from Prisma
 */
export type Drop = PrismaDrop;

/**
 * Drop with relations
 */
export type DropWithRelations = Drop & {
  creator: {
    id: string;
    name: string;
    email: string;
  };
  articles: Array<{
    id: string;
    articleId: string;
    article: {
      id: string;
      name: string;
      code: string;
      price: number;
      images: string[];
      stock: number;
    };
  }>;
  groups: Array<{
    id: string;
    groupId: string;
    group: {
      id: string;
      name: string;
      wahaGroupId: string;
      memberCount: number;
    };
  }>;
  messageTemplate?: {
    id: string;
    name: string;
    content: string;
  } | null;
};

/**
 * Drop History Entry
 */
export interface DropHistoryEntry {
  id: string;
  dropId: string;
  whatsappGroupId: string;
  articleId: string;
  messagesSent: number;
  status: string;
  sentAt: Date;
}
