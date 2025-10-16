/**
 * Drops Routes
 * 
 * Drop management with same-day rule validation and WhatsApp sending
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { createDropSchema, updateDropSchema } from "@/entities/drop/model/types";
import { dropListFiltersSchema } from "@/features/drop-list/model/types";
import { authMiddleware, type AuthContext } from "@/lib/api/middleware/auth";

const app = new Hono<AuthContext>();

app.use("*", authMiddleware);

app.get("/", zValidator("query", dropListFiltersSchema), async (c) => {
  const { search, status, sortBy = "createdAt", sortOrder = "desc", dateFrom, dateTo } = c.req.valid("query");

  const where: Prisma.DropWhereInput = {};

  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }
  if (status) where.status = status as Prisma.DropWhereInput["status"];
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  const drops = await prisma.drop.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      articles: { include: { article: true } },
      groups: { include: { group: true } },
      _count: { select: { history: true } },
    },
  });

  return c.json({ drops });
});

app.get("/:id", async (c) => {
  const id = c.req.param("id");

  const drop = await prisma.drop.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      articles: { include: { article: true } },
      groups: { include: { group: true } },
      history: {
        orderBy: { sentAt: "desc" },
        take: 10,
      },
    },
  });

  if (!drop) {
    return c.json({ error: "Not Found", message: "Drop introuvable" }, 404);
  }

  return c.json(drop);
});

app.post("/", zValidator("json", createDropSchema), async (c) => {
  const data = c.req.valid("json");
  const adminId = c.get("adminId");

  const drop = await prisma.drop.create({
    data: {
      name: data.name,
      status: data.scheduledFor ? "SCHEDULED" : "DRAFT",
      scheduledFor: data.scheduledFor,
      messageTemplateId: data.messageTemplateId,
      createdBy: adminId,
      articles: {
        create: data.articleIds.map((articleId) => ({
          articleId,
        })),
      },
      groups: {
        create: data.whatsappGroupIds.map((groupId) => ({
          groupId,
        })),
      },
    },
    include: {
      articles: { include: { article: true } },
      groups: { include: { group: true } },
    },
  });

  return c.json(drop, 201);
});

app.put("/:id", zValidator("json", updateDropSchema), async (c) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");

  const existing = await prisma.drop.findUnique({ where: { id } });

  if (!existing) {
    return c.json({ error: "Not Found", message: "Drop introuvable" }, 404);
  }

  if (existing.status === "SENT") {
    return c.json(
      { error: "Forbidden", message: "Impossible de modifier un drop déjà envoyé" },
      403
    );
  }

  const drop = await prisma.drop.update({
    where: { id },
    data: {
      name: data.name,
      status: data.status,
      scheduledFor: data.scheduledFor,
      messageTemplateId: data.messageTemplateId,
    },
    include: {
      articles: { include: { article: true } },
      groups: { include: { group: true } },
    },
  });

  return c.json(drop);
});

app.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const drop = await prisma.drop.findUnique({ where: { id } });

  if (!drop) {
    return c.json({ error: "Not Found", message: "Drop introuvable" }, 404);
  }

  if (drop.status === "SENT" || drop.status === "SENDING") {
    return c.json(
      { error: "Forbidden", message: "Impossible de supprimer un drop en cours ou envoyé" },
      403
    );
  }

  await prisma.drop.delete({ where: { id } });

  return c.json({ success: true, message: "Drop supprimé" });
});

app.get("/:id/validate", async (c) => {
  const id = c.req.param("id");

  const drop = await prisma.drop.findUnique({
    where: { id },
    include: {
      articles: { select: { articleId: true } },
      groups: { include: { group: true } },
    },
  });

  if (!drop) {
    return c.json({ error: "Not Found", message: "Drop introuvable" }, 404);
  }

  const articleIds = drop.articles.map((da) => da.articleId);
  const groups = drop.groups.map((dg) => ({
    id: dg.group.id,
    name: dg.group.name,
  }));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const validations = await Promise.all(
    groups.map(async (group) => {
      const sentToday = await prisma.dropHistory.findMany({
        where: {
          whatsappGroupId: group.id,
          sentAt: { gte: today },
        },
        select: { articleId: true },
      });

      const sentArticleIds = new Set(sentToday.map((h) => h.articleId));
      const allowedArticleIds = articleIds.filter((id) => !sentArticleIds.has(id));
      const blockedArticleIds = articleIds.filter((id) => sentArticleIds.has(id));

      const warnings: string[] = [];
      if (blockedArticleIds.length > 0) {
        warnings.push(
          `${blockedArticleIds.length} article(s) déjà envoyé(s) aujourd'hui`
        );
      }

      return {
        groupId: group.id,
        groupName: group.name,
        allowedArticleIds,
        blockedArticleIds,
        warnings,
      };
    })
  );

  const summary = {
    totalGroups: groups.length,
    clearGroups: validations.filter((v) => v.blockedArticleIds.length === 0).length,
    partiallyBlockedGroups: validations.filter(
      (v) => v.blockedArticleIds.length > 0 && v.allowedArticleIds.length > 0
    ).length,
    blockedGroups: validations.filter((v) => v.allowedArticleIds.length === 0).length,
    totalWarnings: validations.reduce((sum, v) => sum + v.warnings.length, 0),
  };

  const canSend = validations.some((v) => v.allowedArticleIds.length > 0);

  return c.json({
    canSend,
    validations,
    summary,
    drop: {
      id: drop.id,
      name: drop.name,
      articleCount: articleIds.length,
      groupCount: groups.length,
    },
  });
});

app.post("/:id/send", async (c) => {
  const id = c.req.param("id");

  const drop = await prisma.drop.findUnique({
    where: { id },
    include: {
      articles: { include: { article: true } },
      groups: { include: { group: true } },
    },
  });

  if (!drop) {
    return c.json({ error: "Not Found", message: "Drop introuvable" }, 404);
  }

  if (drop.status === "SENT") {
    return c.json(
      { error: "Forbidden", message: "Ce drop a déjà été envoyé" },
      403
    );
  }

  await prisma.drop.update({
    where: { id },
    data: {
      status: "SENDING",
      sentAt: new Date(),
    },
  });

  const startTime = Date.now();
  const errors: string[] = [];
  let totalMessagesSent = 0;

  for (const dropGroup of drop.groups) {
    for (const dropArticle of drop.articles) {
      try {
        await prisma.dropHistory.create({
          data: {
            dropId: drop.id,
            articleId: dropArticle.articleId,
            whatsappGroupId: dropGroup.groupId,
            status: "sent",
            messagesSent: 1,
          },
        });

        totalMessagesSent++;
      } catch (error) {
        errors.push(`Erreur groupe ${dropGroup.group.name}: ${error}`);
      }
    }
  }

  await prisma.drop.update({
    where: { id },
    data: {
      status: errors.length > 0 ? "FAILED" : "SENT",
      totalArticlesSent: drop.articles.length,
      totalGroupsSent: drop.groups.length,
    },
  });

  return c.json({
    success: errors.length === 0,
    dropId: drop.id,
    sentAt: new Date(),
    statistics: {
      totalGroups: drop.groups.length,
      totalArticlesSent: drop.articles.length,
      totalMessages: totalMessagesSent,
      duration: Date.now() - startTime,
    },
    errors,
  });
});

app.get("/:id/progress", async (c) => {
  const id = c.req.param("id");

  const drop = await prisma.drop.findUnique({
    where: { id },
    include: {
      groups: { include: { group: true } },
      history: {
        where: {
          sentAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      },
    },
  });

  if (!drop) {
    return c.json({ error: "Not Found", message: "Drop introuvable" }, 404);
  }

  const groupProgress = drop.groups.map((dg) => {
    const sent = drop.history.filter(
      (h) => h.whatsappGroupId === dg.groupId
    );

    return {
      groupId: dg.groupId,
      groupName: dg.group.name,
      status: sent.length > 0 ? ("completed" as const) : ("pending" as const),
      sentCount: sent.length,
      totalCount: drop.history.length,
    };
  });

  return c.json({
    dropId: drop.id,
    status: drop.status === "SENDING" ? "sending" : drop.status === "SENT" ? "completed" : "pending",
    totalGroups: drop.groups.length,
    completedGroups: groupProgress.filter((g) => g.status === "completed").length,
    totalMessages: drop.history.length,
    sentMessages: drop.history.length,
    groups: groupProgress,
    startedAt: drop.sentAt,
    errors: [],
  });
});

app.post("/:id/cancel", async (c) => {
  const id = c.req.param("id");

  const drop = await prisma.drop.findUnique({ where: { id } });

  if (!drop) {
    return c.json({ error: "Not Found", message: "Drop introuvable" }, 404);
  }

  if (drop.status !== "SENDING") {
    return c.json(
      { error: "Forbidden", message: "Aucun envoi en cours à annuler" },
      403
    );
  }

  await prisma.drop.update({
    where: { id },
    data: { status: "FAILED" },
  });

  return c.json({ success: true, message: "Envoi annulé" });
});

export default app;
