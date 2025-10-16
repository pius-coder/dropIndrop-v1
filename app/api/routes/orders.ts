/**
 * Orders Routes
 * 
 * Order management with ticket generation and validation
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { createOrderSchema, validateTicketSchema } from "@/entities/order/model/types";
import { generateTicketCode } from "@/entities/order/lib/ticket-utils";
import { authMiddleware, type AuthContext } from "@/lib/api/middleware/auth";
import { z } from "zod";

const app = new Hono<AuthContext>();

const orderListQuerySchema = z.object({
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  pickupStatus: z.enum(["PENDING", "PICKED_UP", "CANCELLED"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "amount"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

app.get("/", authMiddleware, zValidator("query", orderListQuerySchema), async (c) => {
  const { paymentStatus, pickupStatus, search, page, limit, sortBy = "createdAt", sortOrder = "desc" } = c.req.valid("query");

  const where: Prisma.OrderWhereInput = {};
  const skip = (page - 1) * limit;

  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (pickupStatus) where.pickupStatus = pickupStatus;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { ticketCode: { contains: search, mode: "insensitive" } },
      { customer: { name: { contains: search, mode: "insensitive" } } },
      { customer: { phone: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        article: { select: { id: true, name: true, price: true, images: true } },
        customer: { select: { id: true, name: true, phone: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return c.json({
    orders,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  });
});

app.get("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      article: true,
    },
  });

  if (!order) {
    return c.json({ error: "Not Found", message: "Commande introuvable" }, 404);
  }

  return c.json(order);
});

app.post("/", zValidator("json", createOrderSchema), async (c) => {
  const data = c.req.valid("json");

  const article = await prisma.article.findUnique({
    where: { id: data.articleId },
  });

  if (!article) {
    return c.json({ error: "Not Found", message: "Article introuvable" }, 404);
  }

  if (article.stock < 1) {
    return c.json(
      { error: "Bad Request", message: "Article en rupture de stock" },
      400
    );
  }

  let customer = await prisma.customer.findUnique({
    where: { phone: data.customerPhone },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: data.customerName,
        phone: data.customerPhone,
        email: data.customerEmail,
      },
    });
  }

  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
  const ticketCode = generateTicketCode();
  const ticketQRCode = `DID:${ticketCode}`;
  const ticketExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const order = await prisma.order.create({
    data: {
      orderNumber,
      ticketCode,
      ticketQRCode,
      ticketExpiresAt,
      customerId: customer.id,
      articleId: data.articleId,
      amount: article.price,
      paymentMethod: data.paymentMethod,
      paymentStatus: "PENDING",
      pickupStatus: "PENDING",
    },
    include: {
      article: true,
      customer: true,
    },
  });

  return c.json({
    order,
    ticket: {
      code: order.ticketCode,
      qrCode: order.ticketQRCode,
    },
    paymentInstructions: {
      method: data.paymentMethod,
      instructions: `Envoyez ${article.price} FCFA au numéro correspondant`,
      amount: Number(article.price),
    },
  }, 201);
});

app.post("/validate-ticket", authMiddleware, zValidator("json", validateTicketSchema), async (c) => {
  const { ticketCode } = c.req.valid("json");

  const order = await prisma.order.findFirst({
    where: { ticketCode },
    include: {
      article: { select: { id: true, name: true, price: true, images: true } },
    },
  });

  if (!order) {
    return c.json({
      valid: false,
      message: "Ticket invalide ou introuvable",
      canPickup: false,
    });
  }

  if (order.paymentStatus !== "CONFIRMED") {
    return c.json({
      valid: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        ticketCode: order.ticketCode,
        article: order.article,
        customer: {
          name: order.customerName,
          phone: order.customerPhone,
        },
        paymentStatus: order.paymentStatus,
        pickupStatus: order.pickupStatus,
        totalPrice: Number(order.totalPrice),
        createdAt: order.createdAt,
      },
      message: "Paiement en attente de confirmation",
      canPickup: false,
    });
  }

  if (order.pickupStatus === "PICKED_UP") {
    return c.json({
      valid: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        ticketCode: order.ticketCode,
        article: order.article,
        customer: {
          name: order.customerName,
          phone: order.customerPhone,
        },
        paymentStatus: order.paymentStatus,
        pickupStatus: order.pickupStatus,
        totalPrice: Number(order.totalPrice),
        createdAt: order.createdAt,
      },
      message: "Commande déjà retirée",
      canPickup: false,
    });
  }

  return c.json({
    valid: true,
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      ticketCode: order.ticketCode,
      article: order.article,
      customer: {
        name: order.customerName,
        phone: order.customerPhone,
      },
      paymentStatus: order.paymentStatus,
      pickupStatus: order.pickupStatus,
      totalPrice: Number(order.totalPrice),
      createdAt: order.createdAt,
    },
    message: "Ticket valide - Retrait autorisé",
    canPickup: true,
  });
});

app.post("/:id/pickup", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const adminId = c.get("adminId");

  const order = await prisma.order.findUnique({
    where: { id },
    include: { article: true },
  });

  if (!order) {
    return c.json({ error: "Not Found", message: "Commande introuvable" }, 404);
  }

  if (order.paymentStatus !== "PAID") {
    return c.json(
      { error: "Forbidden", message: "Paiement non confirmé" },
      403
    );
  }

  if (order.pickupStatus === "PICKED_UP") {
    return c.json(
      { error: "Forbidden", message: "Commande déjà retirée" },
      403
    );
  }

  const [updatedOrder] = await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: {
        pickupStatus: "PICKED_UP",
        pickedUpAt: new Date(),
        pickedUpBy: adminId,
      },
    }),
    prisma.article.update({
      where: { id: order.articleId },
      data: {
        stock: { decrement: 1 },
      },
    }),
  ]);

  return c.json({
    success: true,
    order: {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      pickupStatus: updatedOrder.pickupStatus,
      pickedUpAt: updatedOrder.pickedUpAt!,
    },
  });
});

export default app;
