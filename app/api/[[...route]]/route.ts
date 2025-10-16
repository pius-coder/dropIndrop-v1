/**
 * Main API Route Handler
 *
 * Hono app with all routes and middleware
 */

import { Hono } from "hono";
import { handle } from "hono/vercel";
import { logger, errorHandler, cors } from "@/lib/api/middleware";
import auth from "../routes/auth";
import drops from "../routes/drops";
import logout from "../routes/logout";
import dashboard from "../routes/dashboard";
import articles from "../routes/articles";
import orders from "../routes/orders";
import customers from "../routes/customers";
import articlesPublic from "../routes/articles-public";
import purchase from "../routes/purchase";
import payments from "../routes/payments";

export const runtime = "nodejs";

// basePath strips /api/ from incoming requests
// So /api/auth/login becomes /auth/login for Hono routing
const app = new Hono().basePath("/api");

app.use("*", logger);
app.use("*", cors);
app.use("*", errorHandler);

// Health check
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API info
app.get("/", (c) => {
  return c.json({
    name: "Drop-In-Drop API",
    version: "1.0.0",
    description: "WhatsApp E-commerce Platform API",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      articles: "/api/articles",
      drops: "/api/drops",
      orders: "/api/orders",
      customers: "/api/customers",
      admins: "/api/admins",
      categories: "/api/categories",
    },
  });
});

app.route("/auth", auth);
app.route("/auth", logout);
app.route("/dashboard", dashboard);
app.route("/articles", articles);
app.route("/articles", articlesPublic);
app.route("/drops", drops);
app.route("/orders", orders);
app.route("/customers", customers);
app.route("/purchase", purchase);
app.route("/payments", payments);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: "Not Found",
      message: "Route introuvable",
      path: c.req.path,
    },
    404
  );
});

// Export for Next.js
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
