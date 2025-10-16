# Hono API Setup - Implementation Summary

## Overview
Complete API infrastructure with Hono, including authentication, validation, error handling, and standardized responses.

---

## What Was Implemented

### 1. Middleware Layer (`lib/api/middleware/`)

#### Auth Middleware (`auth.ts`)
**Features:**
- `authMiddleware` - Requires valid JWT token
- `optionalAuthMiddleware` - Optional auth for public routes
- JWT verification with hono/jwt
- Attaches admin to context (`c.var.admin`)

**Usage:**
```typescript
import { authMiddleware } from "@/lib/api/middleware";

app.get("/protected", authMiddleware, async (c) => {
  const admin = c.var.admin; // Type-safe admin access
  return c.json({ admin });
});
```

#### Validation Middleware (`validate.ts`)
**Features:**
- `validateBody(schema)` - Validate JSON body
- `validateQuery(schema)` - Validate query parameters
- `validateParam(schema)` - Validate route parameters
- Uses `@hono/zod-validator`
- French error messages

**Usage:**
```typescript
import { validateBody } from "@/lib/api/middleware";
import { createArticleSchema } from "@/entities/article";

app.post("/articles", validateBody(createArticleSchema), async (c) => {
  const data = c.req.valid("json"); // Type-safe validated data
  // ...
});
```

#### Error Handler (`error.ts`)
**Features:**
- Global error catching
- Prisma error handling (P2002, P2025, P2003)
- Zod error handling
- Standardized JSON responses
- French error messages

**Handles:**
- P2002: Unique constraint → 409 Conflict
- P2025: Not found → 404 Not Found
- P2003: Foreign key → 400 Bad Request
- ZodError → 400 Validation Error
- Generic Error → 500 Internal Server Error

#### Logger Middleware (`logger.ts`)
**Features:**
- Request/response logging
- Duration tracking
- Color-coded status (🟢 2xx, 🟡 4xx, 🔴 5xx)
- Console output

**Output:**
```
→ POST /api/articles
🟢 POST /api/articles 201 (42ms)
```

#### CORS Middleware (`cors.ts`)
**Features:**
- Configured for Next.js
- Credentials support
- Common HTTP methods
- 24-hour preflight cache

---

### 2. Utility Functions (`lib/api/utils/`)

#### Response Utilities (`response.ts`)
**Functions:**
- `success(c, data, message?)` - 200 OK
- `created(c, data, message?)` - 201 Created
- `noContent(c)` - 204 No Content
- `badRequest(c, message, details?)` - 400
- `unauthorized(c, message?)` - 401
- `forbidden(c, message?)` - 403
- `notFound(c, message?)` - 404
- `conflict(c, message)` - 409
- `serverError(c, message?)` - 500

**Usage:**
```typescript
import { success, created, notFound } from "@/lib/api/utils";

// Success
return success(c, article, "Article récupéré");

// Created
return created(c, newArticle, "Article créé");

// Not found
return notFound(c, "Article introuvable");
```

**Response Format:**
```json
{
  "success": true,
  "message": "Succès",
  "data": { ... }
}
```

**Error Format:**
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Ressource introuvable"
}
```

#### JWT Utilities (`jwt.ts`)
**Functions:**
- `generateToken(admin)` - Create JWT (7 days expiry)
- `getJWTSecret()` - Get secret key

**Usage:**
```typescript
import { generateToken } from "@/lib/api/utils";

const token = await generateToken(admin);
// Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. Main API Route (`app/api/[[...route]]/route.ts`)

**Features:**
- Hono app with `/api` base path
- Global middleware (logger, CORS, error handler)
- Health check endpoint
- API info endpoint
- 404 handler
- Exported for Next.js (GET, POST, PUT, PATCH, DELETE, OPTIONS)

**Endpoints:**
```
GET  /api          - API info
GET  /api/health   - Health check
```

**Response Examples:**

`GET /api/health`:
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "environment": "development"
}
```

`GET /api`:
```json
{
  "name": "Drop-In-Drop API",
  "version": "1.0.0",
  "description": "WhatsApp E-commerce Platform API",
  "endpoints": {
    "health": "/api/health",
    "auth": "/api/auth",
    "articles": "/api/articles",
    ...
  }
}
```

---

## File Structure

```
did-v1/
├── lib/api/
│   ├── middleware/
│   │   ├── auth.ts           # JWT authentication
│   │   ├── validate.ts       # Zod validation
│   │   ├── error.ts          # Error handling
│   │   ├── logger.ts         # Request logging
│   │   ├── cors.ts           # CORS config
│   │   └── index.ts          # Public API
│   └── utils/
│       ├── response.ts       # Standardized responses
│       ├── jwt.ts            # Token generation
│       └── index.ts          # Public API
└── app/api/[[...route]]/
    └── route.ts              # Main Hono app
```

---

## Usage Examples

### Complete Route Example
```typescript
import { Hono } from "hono";
import { authMiddleware, validateBody } from "@/lib/api/middleware";
import { success, created, notFound } from "@/lib/api/utils";
import { prisma } from "@/lib/db";
import { createArticleSchema } from "@/entities/article";

const articles = new Hono();

// List articles (public)
articles.get("/", async (c) => {
  const articles = await prisma.article.findMany();
  return success(c, articles);
});

// Create article (authenticated)
articles.post(
  "/",
  authMiddleware,
  validateBody(createArticleSchema),
  async (c) => {
    const data = c.req.valid("json");
    const admin = c.var.admin;

    const article = await prisma.article.create({
      data: {
        ...data,
        code: generateArticleCode(),
        uniqueSlug: generateArticleSlug(data.name)
      }
    });

    return created(c, article, "Article créé avec succès");
  }
);

// Get article (public)
articles.get("/:id", async (c) => {
  const id = c.req.param("id");

  const article = await prisma.article.findUnique({
    where: { id }
  });

  if (!article) {
    return notFound(c, "Article introuvable");
  }

  return success(c, article);
});

export { articles };
```

### Register Route in Main App
```typescript
// app/api/[[...route]]/route.ts
import { articles } from "./routes/articles";

app.route("/articles", articles);
```

---

## Environment Variables

```bash
# .env
JWT_SECRET="your-super-secret-key-change-in-production-min-32-chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## Testing

### Health Check
```bash
curl http://localhost:3000/api/health
```

### With Authentication
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/articles
```

### Create Resource
```bash
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"iPhone 15","price":850000,...}'
```

---

## Error Responses

### Validation Error (400)
```json
{
  "error": "Validation Error",
  "message": "Données invalides",
  "details": {
    "fieldErrors": {
      "price": ["Le prix doit être positif"]
    }
  }
}
```

### Unauthorized (401)
```json
{
  "error": "Unauthorized",
  "message": "Token invalide ou expiré"
}
```

### Not Found (404)
```json
{
  "error": "Not Found",
  "message": "Ressource introuvable"
}
```

### Conflict (409)
```json
{
  "error": "Conflict",
  "message": "Cette ressource existe déjà",
  "field": ["email"]
}
```

---

## Security Features

✅ JWT authentication with 7-day expiry
✅ Password hashing (to be implemented with bcrypt)
✅ CORS configuration
✅ Error message sanitization
✅ Type-safe middleware
✅ Request logging

---

## Performance Considerations

### Response Caching
```typescript
// Add cache headers for public routes
app.get("/articles", async (c) => {
  c.header("Cache-Control", "public, max-age=60");
  // ...
});
```

### Database Connection Pooling
Prisma handles this automatically.

### Rate Limiting (TODO)
```typescript
// Future implementation
import { rateLimiter } from "hono-rate-limiter";

app.use("/api/*", rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100 // 100 requests per minute
}));
```

---

## Summary

✅ Complete API infrastructure
✅ JWT authentication middleware
✅ Zod validation integration
✅ Global error handling
✅ Standardized responses
✅ Request logging
✅ CORS configured
✅ Health check endpoint
✅ French localization
✅ Type-safe throughout

**Time:** 45 minutes
**Next:** Step 12 - Shadcn UI Setup (30 min)
