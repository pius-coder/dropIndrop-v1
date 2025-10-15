# Context7 Analysis: Article Entity

## Zod Best Practices

### 1. Schema Validation Patterns

**Basic Refinement:**
```typescript
const myString = z.string().refine((val) => val.length <= 255, {
  message: "String can't be more than 255 characters",
});
```

**Chained Transform & Refine:**
```typescript
z.string()
  .transform((val) => val.trim())
  .refine((val) => val.length > 0, {
    message: "Cannot be empty after trimming"
  });
```

**Complex Object Validation:**
```typescript
const passwordForm = z
  .object({
    password: z.string(),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"], // Custom error path
  });
```

**Async Validation:**
```typescript
const userId = z.string().refine(async (id) => {
  // verify that ID exists in database
  return await checkIdExists(id);
}, {
  message: "ID does not exist"
});
```

### 2. Key Learnings for Drop-In-Drop

**Article Schema Requirements:**
1. **Name**: 3-100 characters
2. **Description**: max 500 characters
3. **Price**: positive number, transformed to decimal
4. **Stock**: non-negative integer
5. **Images**: 1-5 URLs, validated format
6. **Videos**: 0-1 URL, validated format
7. **UniqueSlug**: auto-generated from name

**Implementation Pattern:**
```typescript
export const articleSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name cannot exceed 100 characters")
    .transform(val => val.trim()),
    
  description: z.string()
    .max(500, "Description cannot exceed 500 characters"),
    
  price: z.number()
    .positive("Price must be positive")
    .transform(val => parseFloat(val.toFixed(2))),
    
  stock: z.number()
    .int("Stock must be an integer")
    .nonnegative("Stock cannot be negative"),
    
  minStock: z.number()
    .int()
    .nonnegative()
    .default(5),
    
  images: z.array(z.string().url())
    .min(1, "At least one image is required")
    .max(5, "Maximum 5 images allowed"),
    
  videos: z.array(z.string().url())
    .max(1, "Maximum 1 video allowed")
    .default([]),
    
  categoryId: z.string().uuid(),
  subcategoryId: z.string().uuid().optional()
});
```

---

## Prisma Best Practices

### 1. Generated Types Usage

**Import Pattern:**
```typescript
import { Prisma, type Article } from "@prisma/client";
```

**Type-Safe Queries:**
```typescript
// Using Prisma.validator for select
const articleSelect = Prisma.validator<Prisma.ArticleSelect>()({
  id: true,
  name: true,
  price: true,
  images: true
});

// Using in query
const article = await prisma.article.findUnique({
  where: { id },
  select: articleSelect
});
```

**Generated Types:**
```typescript
// Prisma automatically generates:
export type Article = {
  id: string
  code: string
  name: string
  description: string
  price: Decimal
  stock: number
  minStock: number
  categoryId: string
  subcategoryId: string | null
  images: string[]
  videos: string[]
  uniqueSlug: string
  views: number
  clicksToBuy: number
  status: ArticleStatus
  createdAt: Date
  updatedAt: Date
}
```

### 2. Key Patterns for Article Entity

**Include Relations:**
```typescript
const articleWithRelations = await prisma.article.findUnique({
  where: { id },
  include: {
    category: true,
    subcategory: true
  }
});

// Type inferred as: Article & { category: Category, subcategory: Subcategory | null }
```

**Partial Updates:**
```typescript
const updateData = Prisma.validator<Prisma.ArticleUpdateInput>()({
  name: "New Name",
  stock: { increment: 10 }
});
```

**Query Raw with Types:**
```typescript
import { Article } from "@prisma/client";

const articles = await prisma.$queryRaw<Article[]>`
  SELECT * FROM articles WHERE price > 1000
`;
```

---

## Entity Layer Architecture for Article

### Structure

```
entities/article/
├── model/
│   ├── types.ts          # Zod schema + TS types
│   └── schema.ts         # Exported schema
├── api/
│   ├── article-api.ts    # Client-side API calls
│   └── server.ts         # Server-side queries (optional)
├── lib/
│   ├── article-utils.ts  # Pure functions
│   └── article-rules.ts  # Business rules
└── ui/
    └── article-card.tsx  # Display component
```

### Implementation Plan

**1. Types & Schema (`model/types.ts`)**
- Create Zod schema with validation
- Export inferred TypeScript types
- Extend Prisma types if needed

**2. Pure Functions (`lib/article-utils.ts`)**
- `generateArticleCode()`: Generate unique code
- `generateSlug(name)`: Create URL-friendly slug
- `isLowStock(article)`: Check if stock below minStock
- `formatArticlePrice(price)`: Format price display
- `validateStockUpdate(current, change)`: Validate stock changes

**3. Business Rules (`lib/article-rules.ts`)**
- Check if article can be added to drop
- Validate price changes
- Stock availability rules
- Image/video validation

**4. API Methods (`api/article-api.ts`)**
- `getArticles(filters?)`: List articles
- `getArticle(id)`: Get single article
- `createArticle(data)`: Create new article
- `updateArticle(id, data)`: Update article
- `deleteArticle(id)`: Delete article
- `incrementViews(id)`: Track views
- `incrementClicksToBuy(id)`: Track buy clicks

**5. UI Component (`ui/article-card.tsx`)**
- Display article card
- Show image carousel
- Display price, stock status
- Mobile-first responsive design

---

## Mobile-First UI Patterns

### Article Card Design

**Requirements:**
- Touch-friendly (min 44px tap targets)
- Image aspect ratio: 16:9 or 1:1
- Price prominently displayed
- Stock indicator (low stock warning)
- Quick actions: View, Edit, Delete (admin)

**Responsive Pattern:**
```tsx
// Mobile: Single column
// Tablet: 2 columns
// Desktop: 3-4 columns

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {articles.map(article => (
    <ArticleCard key={article.id} article={article} />
  ))}
</div>
```

**Card Structure:**
```tsx
<Card className="overflow-hidden">
  <div className="aspect-square relative">
    <Image src={article.images[0]} fill />
    {isLowStock && <Badge>Stock faible</Badge>}
  </div>
  
  <CardContent className="p-4">
    <h3 className="font-semibold truncate">{article.name}</h3>
    <p className="text-lg font-bold">{formatPrice(article.price)}</p>
    <p className="text-sm text-muted">Stock: {article.stock}</p>
  </CardContent>
  
  <CardFooter className="p-4 pt-0 gap-2">
    <Button size="sm" className="flex-1">Voir</Button>
    <Button size="sm" variant="outline">Modifier</Button>
  </CardFooter>
</Card>
```

---

## Testing Strategy

### Pure Functions (Easy to Test)
```typescript
// lib/article-utils.test.ts
import { generateSlug, isLowStock } from "./article-utils";

describe("generateSlug", () => {
  it("should create lowercase slug", () => {
    expect(generateSlug("IPhone 15 Pro")).toBe("iphone-15-pro");
  });
  
  it("should remove special characters", () => {
    expect(generateSlug("Article #1!")).toBe("article-1");
  });
});

describe("isLowStock", () => {
  it("should return true when stock below minStock", () => {
    const article = { stock: 3, minStock: 5 };
    expect(isLowStock(article)).toBe(true);
  });
});
```

### Zod Schema Validation
```typescript
// model/types.test.ts
import { articleSchema } from "./types";

describe("articleSchema", () => {
  it("should validate correct data", () => {
    const data = {
      name: "iPhone 15",
      description: "Latest model",
      price: 500000,
      stock: 10,
      images: ["https://example.com/image.jpg"],
      categoryId: "uuid-here"
    };
    
    expect(() => articleSchema.parse(data)).not.toThrow();
  });
  
  it("should reject invalid price", () => {
    const data = { price: -100, /* ... */ };
    expect(() => articleSchema.parse(data)).toThrow("Price must be positive");
  });
});
```

---

## Key Decisions

### 1. Validation Layer
✅ Use Zod for runtime validation (forms, API)  
✅ Use Prisma types for database types  
✅ Keep validation close to entity (model/)  

### 2. Code Generation
✅ Auto-generate article code: `ART-YYYYMMDD-XXXX`  
✅ Auto-generate slug from name  
✅ Server-side only (prevent manipulation)  

### 3. Stock Management
✅ Track views and clicksToBuy separately  
✅ Low stock warning when stock < minStock  
✅ Prevent negative stock (validation)  

### 4. Image/Video Handling
✅ Store URLs only (not files)  
✅ 1-5 images required  
✅ 0-1 video optional  
✅ Validate URL format with Zod  

---

## Summary

**Entity provides:**
✓ Type-safe Zod schema for validation  
✓ Pure utility functions (testable)  
✓ Business rule functions  
✓ Client API methods  
✓ Reusable UI components  
✓ Mobile-first design patterns  

**Next steps:**
1. Implement Article entity files
2. Create Drop entity with business rules
3. Build article-create feature using entity
