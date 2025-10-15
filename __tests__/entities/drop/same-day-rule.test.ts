/**
 * Same-Day Rule Tests
 * 
 * Critical business logic: One article per group per day
 */

import { describe, it, expect } from "vitest";
import {
  canSendDropWithSameDayRule,
  getAllWarnings,
  getValidationSummary,
} from "@/entities/drop/lib/same-day-rule";
import type { SameDayValidation } from "@/entities/drop";

describe("Same-Day Rule", () => {
  describe("canSendDropWithSameDayRule", () => {
    it("should allow send when at least one group has allowed articles", () => {
      const validations: SameDayValidation[] = [
        {
          groupId: "group-1",
          groupName: "Group 1",
          allowedArticleIds: ["article-1", "article-2"],
          blockedArticleIds: [],
          warnings: [],
        },
        {
          groupId: "group-2",
          groupName: "Group 2",
          allowedArticleIds: [],
          blockedArticleIds: ["article-1", "article-2"],
          warnings: ["Blocked"],
        },
      ];

      const canSend = canSendDropWithSameDayRule(validations);
      expect(canSend).toBe(true);
    });

    it("should block send when all groups have no allowed articles", () => {
      const validations: SameDayValidation[] = [
        {
          groupId: "group-1",
          groupName: "Group 1",
          allowedArticleIds: [],
          blockedArticleIds: ["article-1", "article-2"],
          warnings: ["Blocked"],
        },
        {
          groupId: "group-2",
          groupName: "Group 2",
          allowedArticleIds: [],
          blockedArticleIds: ["article-1", "article-2"],
          warnings: ["Blocked"],
        },
      ];

      const canSend = canSendDropWithSameDayRule(validations);
      expect(canSend).toBe(false);
    });

    it("should allow send when all groups have all articles allowed", () => {
      const validations: SameDayValidation[] = [
        {
          groupId: "group-1",
          groupName: "Group 1",
          allowedArticleIds: ["article-1", "article-2", "article-3"],
          blockedArticleIds: [],
          warnings: [],
        },
        {
          groupId: "group-2",
          groupName: "Group 2",
          allowedArticleIds: ["article-1", "article-2", "article-3"],
          blockedArticleIds: [],
          warnings: [],
        },
      ];

      const canSend = canSendDropWithSameDayRule(validations);
      expect(canSend).toBe(true);
    });
  });

  describe("getAllWarnings", () => {
    it("should collect all warnings from validations", () => {
      const validations: SameDayValidation[] = [
        {
          groupId: "group-1",
          groupName: "Group 1",
          allowedArticleIds: ["article-1"],
          blockedArticleIds: ["article-2"],
          warnings: ["Warning 1", "Warning 2"],
        },
        {
          groupId: "group-2",
          groupName: "Group 2",
          allowedArticleIds: [],
          blockedArticleIds: ["article-1", "article-2"],
          warnings: ["Warning 3"],
        },
      ];

      const warnings = getAllWarnings(validations);
      expect(warnings).toHaveLength(3);
      expect(warnings).toContain("Warning 1");
      expect(warnings).toContain("Warning 2");
      expect(warnings).toContain("Warning 3");
    });

    it("should return empty array when no warnings", () => {
      const validations: SameDayValidation[] = [
        {
          groupId: "group-1",
          groupName: "Group 1",
          allowedArticleIds: ["article-1", "article-2"],
          blockedArticleIds: [],
          warnings: [],
        },
      ];

      const warnings = getAllWarnings(validations);
      expect(warnings).toHaveLength(0);
    });
  });

  describe("getValidationSummary", () => {
    it("should correctly summarize validation results", () => {
      const validations: SameDayValidation[] = [
        {
          groupId: "group-1",
          groupName: "Group 1",
          allowedArticleIds: ["article-1", "article-2"],
          blockedArticleIds: [],
          warnings: [],
        },
        {
          groupId: "group-2",
          groupName: "Group 2",
          allowedArticleIds: ["article-1"],
          blockedArticleIds: ["article-2"],
          warnings: ["Partial block"],
        },
        {
          groupId: "group-3",
          groupName: "Group 3",
          allowedArticleIds: [],
          blockedArticleIds: ["article-1", "article-2"],
          warnings: ["Fully blocked"],
        },
      ];

      const summary = getValidationSummary(validations);
      
      expect(summary.totalGroups).toBe(3);
      expect(summary.clearGroups).toBe(1); // group-1
      expect(summary.partiallyBlockedGroups).toBe(1); // group-2
      expect(summary.blockedGroups).toBe(1); // group-3
      expect(summary.totalWarnings).toBe(2);
    });
  });
});
