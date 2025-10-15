# Prisma Client Setup - Implementation Summary

## Overview
Configured Prisma client for Next.js with singleton pattern, seed script, and database utilities.

---

## What Was Implemented

### 1. Database Client (`lib/db.ts`)

**Singleton Pattern:**
```typescript
// Development: Hot reload safe (uses globalThis)
// Production: Single instance
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
```

**Features:**
- ✅ Development: Query logging enabled
- ✅ Production: Error logging only
- ✅ Hot reload safe (Next.js dev server)
- ✅ TypeScript support
- ✅ Helper functions:
  - `checkDatabaseConnection()` - Test connection
  - `disconnectPrisma()` - Cleanup for tests

**Logging Configuration:**
```typescript
log: process.env.NODE_ENV === "development"
  ? ["query", "error", "warn"]  // Dev: verbose
  : ["error"]                    // Prod: errors only
```

---

### 2. Seed Script (`prisma/seed.ts`)

**Seed Data:**
1. **Admins** (2)
   - Super Admin (admin@dropindrop.cm)
   - Delivery Manager (manager@dropindrop.cm)

2. **Categories** (3)
   - Électronique (smartphones, ordinateurs)
   - Mode (vêtements homme)
   - Maison & Jardin

3. **Articles** (3)
   - iPhone 15 Pro Max - 850,000 FCFA
   - MacBook Pro 14 M3 - 1,200,000 FCFA
   - Chemise Homme - 15,000 FCFA

4. **Customers** (2)
   - Jean Mballa (+237 672 345 678)
   - Marie Ngo (+237 692 345 678)

5. **WhatsApp Groups** (2)
   - Clients VIP (50 membres)
   - Clients Généraux (150 membres)

6. **Message Template** (1)
   - Template Promotion (default)

7. **Site Settings** (1)
   - Store info, payment config, WAHA config

**Features:**
- ✅ Development: Clears data before seeding
- ✅ Production-safe (checks NODE_ENV)
- ✅ Password hashing (simple demo - use bcrypt in prod)
- ✅ Complete data for testing
- ✅ French content

**Run Command:**
```bash
pnpm db:seed
```

---

## Usage Examples

### Basic Query
```typescript
import { prisma } from "@/lib/db";

// Get all articles
const articles = await prisma.article.findMany({
  where: { status: "AVAILABLE" },
  include: {
    category: true,
    subcategory: true
  }
});
```

### With Error Handling
```typescript
import { prisma, checkDatabaseConnection } from "@/lib/db";

try {
  const connected = await checkDatabaseConnection();
  if (!connected) {
    throw new Error("Database not available");
  }
  
  const articles = await prisma.article.findMany();
  return articles;
} catch (error) {
  console.error("Database error:", error);
  throw error;
}
```

### In API Route
```typescript
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const articles = await prisma.article.findMany();
  return Response.json(articles);
}
```

### Transaction
```typescript
import { prisma } from "@/lib/db";

await prisma.$transaction(async (tx) => {
  // Create order
  const order = await tx.order.create({ data: orderData });
  
  // Decrement stock
  await tx.article.update({
    where: { id: articleId },
    data: { stock: { decrement: 1 } }
  });
  
  return order;
});
```

---

## Database Setup

### 1. Environment Variables
```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/did_v1?schema=public"
```

### 2. Generate Prisma Client
```bash
pnpm db:generate
```

### 3. Push Schema to Database
```bash
pnpm db:push
```

### 4. Seed Database
```bash
pnpm db:seed
```

### 5. Open Prisma Studio (optional)
```bash
pnpm db:studio
```

---

## Prisma Commands

**Package.json scripts:**
```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

**Usage:**
- `db:generate` - Generate Prisma Client from schema
- `db:push` - Push schema changes to database (dev)
- `db:studio` - Open visual database editor
- `db:seed` - Run seed script

---

## Testing

### Check Connection
```typescript
import { checkDatabaseConnection } from "@/lib/db";

describe("Database", () => {
  it("should connect successfully", async () => {
    const connected = await checkDatabaseConnection();
    expect(connected).toBe(true);
  });
});
```

### Cleanup After Tests
```typescript
import { disconnectPrisma } from "@/lib/db";

afterAll(async () => {
  await disconnectPrisma();
});
```

---

## Production Considerations

### 1. Connection Pooling
Prisma automatically handles connection pooling.

**Configure in schema.prisma:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**For production, use connection pooler URL:**
```bash
# Supabase/Neon connection pooler
DATABASE_URL="postgresql://user:pass@pooler.region.provider.com:5432/db?pgbouncer=true"
```

### 2. Password Hashing
Replace simple hash with bcrypt:

```bash
pnpm add bcrypt
pnpm add -D @types/bcrypt
```

```typescript
import bcrypt from "bcrypt";

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}
```

### 3. Migration Strategy
For production, use migrations instead of `db push`:

```bash
# Create migration
pnpm prisma migrate dev --name initial

# Apply migration in production
pnpm prisma migrate deploy
```

---

## Seed Data Credentials

**Admin Login:**
- **Email:** admin@dropindrop.cm
- **Password:** Admin123!
- **Role:** SUPER_ADMIN

**Manager Login:**
- **Email:** manager@dropindrop.cm
- **Password:** Manager123!
- **Role:** DELIVERY_MANAGER

⚠️ **Change these in production!**

---

## File Structure

```
did-v1/
├── lib/
│   └── db.ts                 # Prisma client singleton
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed script
└── docs/features/07-prisma-setup/
    └── implementation-summary.md
```

---

## Performance Tips

### 1. Select Only Needed Fields
```typescript
// ❌ Bad: Fetches all fields
const articles = await prisma.article.findMany();

// ✅ Good: Only needed fields
const articles = await prisma.article.findMany({
  select: {
    id: true,
    name: true,
    price: true
  }
});
```

### 2. Use Pagination
```typescript
const articles = await prisma.article.findMany({
  take: 20,        // Limit
  skip: page * 20, // Offset
});
```

### 3. Batch Operations
```typescript
// ✅ Good: Single query
await prisma.article.createMany({
  data: articles
});

// ❌ Bad: Multiple queries
for (const article of articles) {
  await prisma.article.create({ data: article });
}
```

---

## Summary

✅ Prisma client singleton (hot reload safe)  
✅ Seed script with complete test data  
✅ Database connection helpers  
✅ Development logging enabled  
✅ Production-ready configuration  
✅ French content in seed data  
✅ Ready for API implementation  

**Time:** 30 minutes  
**Next:** Step 11 - Hono API Setup (45 min)
