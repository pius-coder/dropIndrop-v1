/**
 * Drop Send - Types
 */

import { z } from "zod";

/**
 * Send progress status
 */
export type SendStatus = "pending" | "sending" | "completed" | "failed";

/**
 * Send progress per group
 */
export interface GroupSendProgress {
  groupId: string;
  groupName: string;
  status: SendStatus;
  sentCount: number;
  totalCount: number;
  currentArticle?: string;
  error?: string;
}

/**
 * Overall send progress
 */
export interface SendProgress {
  dropId: string;
  status: SendStatus;
  totalGroups: number;
  completedGroups: number;
  totalMessages: number;
  sentMessages: number;
  groups: GroupSendProgress[];
  startedAt?: Date;
  completedAt?: Date;
  errors: string[];
}

/**
 * Send drop response
 */
export interface SendDropResponse {
  success: boolean;
  dropId: string;
  sentAt: Date;
  statistics: {
    totalGroups: number;
    totalArticlesSent: number;
    totalMessages: number;
    duration: number; // milliseconds
  };
  errors: string[];
}

/**
 * Send drop request
 */
export const sendDropRequestSchema = z.object({
  dropId: z.string().uuid(),
  force: z.boolean().optional(), // Force send even with warnings
});

export type SendDropRequest = z.infer<typeof sendDropRequestSchema>;
