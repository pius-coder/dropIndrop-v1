# 🗺️ Drop-In-Drop Implementation Roadmap

## Principle: Small, Incremental, Testable Steps

Each step follows this cycle:
1. **Create docs folder** for the feature
2. **Context7 analysis** → document findings
3. **Implement** → write code
4. **Document** → write implementation summary
5. **Commit** → git commit with clear message
6. **Verify** → check everything works
7. **Move to next** → repeat

---

## ✅ COMPLETED

### Week 1: Foundation
- ✅ **Step 1:** Git initialization
- ✅ **Step 2:** Foundation layer (shared/)
  - API client, React Query, Zustand stores, utilities
  - Commit: 56eddcd

### Week 2: Entities (Partial)
- ✅ **Step 3:** Article entity (entities/article/)
  - Types, validation, utilities, API, UI component
  - Commit: 855107c
- ✅ **Step 4:** Drop entity with same-day rule (entities/drop/)
  - Types, same-day rule logic, API, validation
  - Commit: 10f0c7c

---

## 🔄 IN PROGRESS

### Week 2: Complete Entity Layer

#### **Step 5: Order Entity** (NEXT - 30 min)
```
docs/features/03-entity-order/
  ├── context7-analysis.md      # Payment, ticket generation patterns
  ├── implementation-summary.md
entities/order/
  ├── model/
  │   ├── types.ts              # Order, PaymentStatus, PickupStatus
  │   └── index.ts
  ├── lib/
  │   ├── order-utils.ts        # generateTicketCode, isPickedUp, etc.
  │   ├── payment-utils.ts      # Payment validation, MTN/Orange
  │   └── index.ts
  ├── api/
  │   ├── order-api.ts          # createOrder, validateTicket, etc.
  │   └── index.ts
  └── index.ts
```

**Context7 Topics:**
- Payment flow patterns (MTN Mobile Money, Orange Money)
- QR code generation
- Ticket validation systems

**Key Functions:**
- `generateTicketCode()` - Unique ticket generation
- `generateQRCode()` - QR code for ticket
- `validateTicket()` - Check ticket validity
- `canPickup()` - Check if order can be picked up
- Payment status management

**Commit:** `feat: Order entity with payment & ticket system`

---

#### **Step 6: Customer Entity** (20 min)
```
docs/features/04-entity-customer/
entities/customer/
  ├── model/types.ts            # Customer type, validation
  ├── lib/customer-utils.ts     # Statistics, loyalty checks
  ├── api/customer-api.ts       # CRUD operations
  └── index.ts
```

**Key Functions:**
- `getCustomerStats()` - Total orders, total spent
- `isLoyalCustomer()` - Check loyalty threshold
- `formatPhoneNumber()` - Cameroon format (+237)

**Commit:** `feat: Customer entity with loyalty tracking`

---

#### **Step 7: Admin Entity** (15 min)
```
docs/features/05-entity-admin/
entities/admin/
  ├── model/types.ts            # Admin, roles, permissions
  ├── lib/admin-utils.ts        # Role checks, permissions
  ├── api/admin-api.ts          # Admin management
  └── index.ts
```

**Key Functions:**
- `hasPermission()` - Check role-based permissions
- `canManageDrops()`, `canValidateOrders()`, etc.

**Commit:** `feat: Admin entity with role-based permissions`

---

#### **Step 8: Category Entity** (15 min)
```
docs/features/06-entity-category/
entities/category/
  ├── model/types.ts            # Category, Subcategory
  ├── lib/category-utils.ts     # Tree navigation
  ├── api/category-api.ts       # CRUD operations
  └── index.ts
```

**Key Functions:**
- `getCategoryTree()` - Hierarchical structure
- `getArticleCount()` - Articles per category

**Commit:** `feat: Category entity for catalog organization`

---

#### **Step 9: Commit Checkpoint** (5 min)
- Review all entities
- Run type-check: `pnpm type-check`
- Verify no errors
- **Milestone commit:** `chore: All entities complete - ready for features`

---

## Week 3: Infrastructure Setup

#### **Step 10: Prisma Client Setup** (30 min)
```
docs/features/07-prisma-setup/
lib/db.ts                        # Prisma client singleton
prisma/seed.ts                   # Seed data script
```

**Tasks:**
- Configure Prisma client for Next.js
- Create database singleton (dev vs prod)
- Write seed script for initial data
- Test connection

**Commit:** `feat: Prisma client setup with database connection`

---

#### **Step 11: Hono API Setup** (45 min)
```
docs/features/08-api-setup/
app/api/[[...route]]/
  └── route.ts                   # Main Hono app
lib/api/
  ├── middleware/
  │   ├── auth.ts               # JWT auth middleware
  │   ├── validate.ts           # Zod validation middleware
  │   └── error.ts              # Error handler
  └── utils/
      └── response.ts           # Standardized responses
```

**Tasks:**
- Setup Hono app with route handler
- Auth middleware (JWT verification)
- Validation middleware (Zod integration)
- Error handling middleware
- Test endpoints

**Commit:** `feat: Hono API setup with auth & validation`

---

#### **Step 12: Shadcn UI Setup** (30 min)
```
docs/features/09-shadcn-setup/
components/ui/
  ├── button.tsx                # Using MCP
  ├── input.tsx
  ├── card.tsx
  ├── badge.tsx
  └── ... (core components)
```

**Tasks:**
- Initialize shadcn with MCP
- Add core mobile-first components
- Create theme configuration
- Test responsive behavior

**Commit:** `feat: Shadcn UI mobile-first component library`

---

## Week 3-4: Feature Layer (One Feature at a Time)

### **Feature Group 1: Article Management**

#### **Step 13: Feature - article-list** (1 hour)
```
docs/features/10-article-list/
  ├── context7-analysis.md      # React Query list patterns, infinite scroll
  ├── implementation-summary.md
features/article-list/
  ├── ui/
  │   └── article-list.tsx      # List with filters
  ├── model/
  │   └── use-article-list.ts   # React Query hook
  └── index.ts
```

**Context7 Topics:**
- React Query pagination
- Filtering patterns
- Mobile-first list layouts

**What it does:**
- Display articles in grid
- Filter by category, status, search
- Pagination
- Mobile responsive

**Commit:** `feat: article-list - display & filter articles`

---

#### **Step 14: Feature - article-create** (1.5 hours)
```
docs/features/11-article-create/
features/article-create/
  ├── ui/
  │   └── create-article-form.tsx
  ├── model/
  │   └── use-create-article.ts    # Form + mutation
  ├── api/
  │   └── server.ts                # Hono handler
  └── index.ts
app/api/[[...route]]/route.ts      # Register route
```

**Context7 Topics:**
- React Hook Form + Zod
- File upload patterns
- Optimistic updates

**What it does:**
- Multi-step form (info → images → review)
- Image upload (URL input for now)
- Validation with Zod
- Auto-generate code & slug
- Mobile-friendly form

**API Endpoint:** `POST /api/articles`

**Commit:** `feat: article-create - form & API endpoint`

---

#### **Step 15: Feature - article-update** (1 hour)
```
docs/features/12-article-update/
features/article-update/
  ├── ui/article-update-form.tsx
  ├── model/use-update-article.ts
  ├── api/server.ts
  └── index.ts
```

**API Endpoint:** `PUT /api/articles/:id`

**Commit:** `feat: article-update - edit existing articles`

---

#### **Step 16: Feature - article-delete** (30 min)
```
docs/features/13-article-delete/
features/article-delete/
  ├── ui/delete-button.tsx
  ├── model/use-delete-article.ts
  ├── api/server.ts
  └── index.ts
```

**What it does:**
- Confirmation modal
- Soft delete (archive) option
- Optimistic update

**API Endpoint:** `DELETE /api/articles/:id`

**Commit:** `feat: article-delete - remove articles safely`

---

#### **Step 17: Feature - article-stock** (45 min)
```
docs/features/14-article-stock/
features/article-stock/
  ├── ui/stock-update-form.tsx
  ├── model/use-update-stock.ts
  ├── api/server.ts
  └── index.ts
```

**What it does:**
- Quick stock adjustment (+ / -)
- Validation (no negative)
- History tracking
- Low stock alerts

**API Endpoint:** `PATCH /api/articles/:id/stock`

**Commit:** `feat: article-stock - inventory management`

---

### **Feature Group 2: Drop Management**

#### **Step 18: Feature - drop-create** (2 hours)
```
docs/features/15-drop-create/
features/drop-create/
  ├── ui/
  │   ├── drop-form.tsx
  │   └── article-selector.tsx
  ├── model/
  │   └── use-create-drop.ts
  ├── api/
  │   └── server.ts
  └── index.ts
```

**Context7 Topics:**
- Multi-select components
- Form wizard patterns
- Preview before submit

**What it does:**
- Step 1: Name + template
- Step 2: Select articles (multi-select with preview)
- Step 3: Select WhatsApp groups (multi-select)
- Step 4: Schedule (optional)
- Step 5: Preview & create

**API Endpoint:** `POST /api/drops`

**Commit:** `feat: drop-create - multi-step drop creation`

---

#### **Step 19: Feature - drop-validate** (1.5 hours)
```
docs/features/16-drop-validate/
features/drop-validate/
  ├── ui/
  │   └── validation-display.tsx
  ├── model/
  │   └── use-validate-drop.ts
  ├── api/
  │   └── server.ts               # Same-day rule check
  └── index.ts
```

**What it does:**
- Check same-day rule for all groups
- Display warnings per group
- Show blocked articles
- Allow/prevent send based on results

**API Endpoint:** `GET /api/drops/:id/validate`

**Commit:** `feat: drop-validate - same-day rule enforcement UI`

---

#### **Step 20: Feature - drop-send** (2 hours)
```
docs/features/17-drop-send/
features/drop-send/
  ├── ui/
  │   ├── send-button.tsx
  │   └── send-progress.tsx
  ├── model/
  │   └── use-send-drop.ts
  ├── api/
  │   └── server.ts               # WAHA integration
  └── index.ts
```

**Context7 Topics:**
- WebSocket for progress
- Queue management
- Error handling

**What it does:**
- Validate before send
- Send to WAHA API (WhatsApp)
- Real-time progress updates
- Create DropHistory entries
- Handle errors gracefully

**API Endpoint:** `POST /api/drops/:id/send`

**Commit:** `feat: drop-send - WhatsApp integration & sending`

---

#### **Step 21: Feature - drop-list** (45 min)
```
docs/features/18-drop-list/
features/drop-list/
  ├── ui/drop-list.tsx
  ├── model/use-drop-list.ts
  └── index.ts
```

**What it does:**
- List all drops
- Filter by status, date
- Status badges
- Quick actions (view, send, delete)

**Commit:** `feat: drop-list - display & manage drops`

---

### **Feature Group 3: Order Management**

#### **Step 22: Feature - order-create** (2 hours)
```
docs/features/19-order-create/
features/order-create/
  ├── ui/order-form.tsx
  ├── model/use-create-order.ts
  ├── api/server.ts               # Payment integration
  └── index.ts
```

**What it does:**
- Select article
- Customer info (phone, name)
- Payment method (MTN/Orange)
- Generate ticket with QR code
- Send ticket via WhatsApp

**API Endpoint:** `POST /api/orders`

**Commit:** `feat: order-create - create orders with tickets`

---

#### **Step 23: Feature - order-validate** (1 hour)
```
docs/features/20-order-validate/
features/order-validate/
  ├── ui/
  │   ├── ticket-scanner.tsx
  │   └── validate-form.tsx
  ├── model/use-validate-ticket.ts
  ├── api/server.ts
  └── index.ts
```

**What it does:**
- Scan QR code or enter ticket code
- Validate ticket
- Mark as picked up
- Update stock

**API Endpoint:** `POST /api/orders/:id/validate`

**Commit:** `feat: order-validate - ticket validation & pickup`

---

#### **Step 24: Feature - order-list** (45 min)
```
docs/features/21-order-list/
features/order-list/
  ├── ui/order-list.tsx
  ├── model/use-order-list.ts
  └── index.ts
```

**What it does:**
- List all orders
- Filter by status, payment, pickup
- Quick actions

**Commit:** `feat: order-list - order management dashboard`

---

## Week 5: Pages Layer

#### **Step 25: Page - admin-dashboard** (1 hour)
```
docs/features/22-admin-dashboard/
pages/admin-dashboard/
  ├── ui/dashboard-page.tsx
  ├── model/use-dashboard-stats.ts
  └── index.ts
app/admin/page.tsx
```

**What it displays:**
- Total articles, drops, orders
- Low stock alerts
- Recent activity
- Quick actions

**Commit:** `feat: admin-dashboard - overview page`

---

#### **Step 26: Page - admin-articles** (45 min)
```
pages/admin-articles/
  ├── ui/articles-page.tsx
  └── index.ts
app/admin/articles/page.tsx
```

**Uses features:**
- article-list
- article-create
- article-update
- article-delete

**Commit:** `feat: admin-articles - articles management page`

---

#### **Step 27: Page - admin-drops** (45 min)
```
pages/admin-drops/
app/admin/drops/page.tsx
```

**Uses features:**
- drop-list
- drop-create
- drop-validate
- drop-send

**Commit:** `feat: admin-drops - drops management page`

---

#### **Step 28: Page - admin-orders** (45 min)
```
pages/admin-orders/
app/admin/orders/page.tsx
```

**Uses features:**
- order-list
- order-validate

**Commit:** `feat: admin-orders - orders management page`

---

#### **Step 29: Page - client-home** (1 hour)
```
pages/client-home/
app/(client)/page.tsx
```

**What it displays:**
- Featured articles
- Categories
- Search
- Mobile-first design

**Commit:** `feat: client-home - public homepage`

---

#### **Step 30: Page - article-view** (1 hour)
```
pages/article-view/
app/(client)/articles/[slug]/page.tsx
```

**What it displays:**
- Article details
- Image carousel
- Buy button
- Related articles

**Commit:** `feat: article-view - public article page`

---

## Week 6: Testing & Polish

#### **Step 31: Unit Tests** (2 hours)
```
tests/
  ├── entities/
  │   ├── article.test.ts
  │   ├── drop.test.ts
  │   └── same-day-rule.test.ts
  └── features/
      └── (feature tests)
```

**What to test:**
- Pure functions (utils)
- Business rules
- Validation schemas
- Same-day rule logic

**Commit:** `test: unit tests for entities & features`

---

#### **Step 32: Integration Tests** (2 hours)
```
tests/integration/
  ├── api/
  │   ├── articles.test.ts
  │   ├── drops.test.ts
  │   └── orders.test.ts
  └── features/
```

**Commit:** `test: integration tests for API & features`

---

#### **Step 33: Final Polish** (2 hours)
- Error boundaries
- Loading states
- Toast notifications
- Mobile optimization
- Accessibility

**Commit:** `polish: error handling, loading states, a11y`

---

#### **Step 34: Documentation** (1 hour)
```
docs/
  ├── API.md                      # API documentation
  ├── DEPLOYMENT.md               # Deployment guide
  └── USER_GUIDE.md               # User manual
```

**Commit:** `docs: complete project documentation`

---

## 🎯 Summary

**Total Steps:** 34  
**Estimated Time:** 4-5 weeks  
**Features:** 21 features  
**Pages:** 6 pages  

**Key Milestones:**
1. ✅ Foundation complete (Week 1)
2. 🔄 All entities (Week 2) - 40% done
3. ⏳ Infrastructure (Week 3)
4. ⏳ Features (Week 3-4)
5. ⏳ Pages (Week 5)
6. ⏳ Tests & Polish (Week 6)

**Next Immediate Step:** Step 5 - Order Entity (30 min)
