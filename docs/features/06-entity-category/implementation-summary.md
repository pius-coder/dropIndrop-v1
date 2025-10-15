# Category Entity - Implementation Summary

## Overview
Category entity for catalog organization with hierarchical structure (categories → subcategories).

---

## What Was Implemented

### 1. Model Layer

**Schemas:**
- `createCategorySchema` - Name, icon, order
- `updateCategorySchema` - Partial updates
- `createSubcategorySchema` - Name, categoryId, order
- `updateSubcategorySchema` - Partial updates

**Types:**
- `CategoryWithSubcategories` - Includes nested subcategories & counts
- `SubcategoryWithCategory` - Includes parent category
- `CategoryTreeNode` - Hierarchical structure for UI

**Features:**
- Auto-generated slugs from names
- Order management (0-based)
- Article counts per category/subcategory
- Icon support (lucide-react icons)

---

### 2. Library Layer

**Tree Building:**
- `buildCategoryTree(categories)` - Converts flat to hierarchical
- `getCategoryBreadcrumb(category, subcategory?)` - Navigation path

**Slug Utilities:**
- `generateCategorySlug(name)` - Auto-generate from name
- `findCategoryBySlug(categories, slug)` - Find by slug
- `findSubcategoryBySlug(subcategories, slug)` - Find by slug

**Navigation:**
- `getSubcategoriesForCategory(category)` - Get sorted subcategories
- `hasSubcategories(category)` - Check if has children
- `getTotalArticleCount(category)` - Count articles

**Order Management:**
- `validateCategoryOrder(categories, newOrder)` - Check duplicates
- `suggestNextOrder(categories)` - Auto-suggest next order
- `reorderCategories(categories)` - Make sequential (0, 1, 2...)

---

### 3. API Layer (14 methods)

**Categories:**
- `getCategories()` - List all with subcategories
- `getCategoryTree()` - Hierarchical structure
- `getCategory(id)` - By ID
- `getCategoryBySlug(slug)` - By slug
- `createCategory(data)` - Create new
- `updateCategory(id, data)` - Update
- `deleteCategory(id)` - Delete
- `reorderCategories(orders)` - Batch reorder

**Subcategories:**
- `getSubcategories()` - List all
- `getSubcategory(id)` - By ID
- `createSubcategory(data)` - Create new
- `updateSubcategory(id, data)` - Update
- `deleteSubcategory(id)` - Delete

---

## File Structure

```
entities/category/
├── model/
│   ├── types.ts              # Zod schemas + types
│   └── index.ts
├── api/
│   ├── category-api.ts       # 14 API methods
│   └── index.ts
├── lib/
│   ├── category-utils.ts     # Tree building, navigation
│   └── index.ts
└── index.ts
```

---

## Usage Examples

### Build Category Tree
```typescript
import { getCategoryTree, buildCategoryTree } from "@/entities/category";

// From API
const tree = await getCategoryTree();

// Or build from flat data
const categories = await getCategories();
const tree = buildCategoryTree(categories);

// Result:
// [
//   {
//     id: "1",
//     name: "Électronique",
//     slug: "electronique",
//     subcategories: [
//       { id: "1a", name: "Smartphones", slug: "smartphones" },
//       { id: "1b", name: "Laptops", slug: "laptops" }
//     ]
//   }
// ]
```

### Navigation Breadcrumb
```typescript
import { getCategoryBreadcrumb } from "@/entities/category";

const breadcrumb = getCategoryBreadcrumb(category, subcategory);
// [
//   { name: "Électronique", slug: "electronique" },
//   { name: "Smartphones", slug: "smartphones" }
// ]
```

### Reorder Categories
```typescript
import { reorderCategories } from "@/entities/category";

// Admin drags to reorder
await reorderCategories([
  { id: "cat-1", order: 0 },
  { id: "cat-2", order: 1 },
  { id: "cat-3", order: 2 }
]);
```

### Create Category with Subcategories
```typescript
import { createCategory, createSubcategory } from "@/entities/category";

const category = await createCategory({
  name: "Vêtements",
  icon: "shirt",
  order: 0
});

await createSubcategory({
  name: "Hommes",
  categoryId: category.id,
  order: 0
});

await createSubcategory({
  name: "Femmes",
  categoryId: category.id,
  order: 1
});
```

---

## Testing

```typescript
describe("buildCategoryTree", () => {
  it("should build hierarchical structure", () => {
    const categories = [
      {
        id: "1",
        name: "Cat1",
        slug: "cat1",
        order: 0,
        subcategories: [
          { id: "1a", name: "Sub1", slug: "sub1", order: 0 }
        ]
      }
    ];
    
    const tree = buildCategoryTree(categories);
    expect(tree[0].subcategories).toHaveLength(1);
  });
});

describe("suggestNextOrder", () => {
  it("should suggest next sequential order", () => {
    const categories = [
      { order: 0 },
      { order: 2 }
    ];
    
    expect(suggestNextOrder(categories)).toBe(3);
  });
});
```

---

## UI Patterns

### Category Navigation
```tsx
// Mobile: Tabs or Accordion
// Desktop: Sidebar with tree

{tree.map(category => (
  <div key={category.id}>
    <h3>{category.name}</h3>
    <ul>
      {category.subcategories.map(sub => (
        <li key={sub.id}>
          <Link href={`/catalog/${category.slug}/${sub.slug}`}>
            {sub.name} ({sub.articleCount})
          </Link>
        </li>
      ))}
    </ul>
  </div>
))}
```

### Breadcrumb Navigation
```tsx
// Home > Électronique > Smartphones

const breadcrumb = getCategoryBreadcrumb(category, subcategory);

<nav>
  <Link href="/">Home</Link>
  {breadcrumb.map(item => (
    <Link key={item.slug} href={`/catalog/${item.slug}`}>
      {item.name}
    </Link>
  ))}
</nav>
```

---

## Summary

✓ Hierarchical catalog structure
✓ Category tree building
✓ Slug-based navigation
✓ Order management
✓ 14 API methods
✓ Breadcrumb generation
✓ Article counting
✓ French localization

**Time:** 15 minutes  
**Next:** Step 9 - Milestone commit (All entities complete!)
