# 🎯 ADMIN PAGES - COMPLETE IMPLEMENTATION PLAN

## 📊 INVENTORY - What Exists

### Existing Admin Page Components (in `/pages`)
```
pages/
├── admin-articles/    ✅ EXISTS
│   ├── ui/
│   │   ├── articles-page.tsx
│   │   ├── article-form.tsx
│   │   └── new-article-page.tsx
│   └── index.ts
│
├── admin-dashboard/   ✅ EXISTS
│   ├── ui/
│   │   └── dashboard-page.tsx
│   ├── model/
│   │   └── use-dashboard-stats.ts
│   └── index.ts
│
├── admin-drops/       ✅ EXISTS
│   ├── ui/
│   │   ├── drops-page.tsx
│   │   └── new-drop-page.tsx
│   └── index.ts
│
└── admin-orders/      ✅ EXISTS
    ├── ui/
    │   ├── orders-page.tsx
    │   └── order-detail-page.tsx
    └── index.ts
```

### Missing Admin Pages
```
❌ admin-settings/ (Site configuration - SUPER ADMIN only)
❌ admin-team/ (Team management - SUPER ADMIN only)
❌ admin-categories/ (Category management)
❌ admin-whatsapp-groups/ (WhatsApp group management)
```

---

## 🏗️ ADMIN ROUTE STRUCTURE (in `/app`)

### Target Structure
```
app/
└── (admin)/
    ├── layout.tsx (admin auth wrapper)
    ├── page.tsx → redirect to /admin/dashboard
    │
    ├── dashboard/
    │   └── page.tsx
    │
    ├── articles/
    │   ├── page.tsx (list)
    │   ├── new/
    │   │   └── page.tsx
    │   └── [id]/
    │       └── edit/
    │           └── page.tsx
    │
    ├── drops/
    │   ├── page.tsx (list)
    │   ├── new/
    │   │   └── page.tsx
    │   └── [id]/
    │       └── page.tsx (detail)
    │
    ├── orders/
    │   ├── page.tsx (list)
    │   └── [id]/
    │       └── page.tsx (detail)
    │
    ├── categories/
    │   └── page.tsx (NEW)
    │
    ├── whatsapp-groups/
    │   └── page.tsx (NEW)
    │
    ├── settings/
    │   └── page.tsx (NEW - SUPER ADMIN)
    │
    └── team/
        └── page.tsx (NEW - SUPER ADMIN)
```

---

## ✅ IMPLEMENTATION STEPS

### STEP 1: Create Admin Layout with Auth
**File:** `app/(admin)/layout.tsx`

Features:
- Check admin authentication
- Redirect to /login if not authenticated
- Show admin navigation sidebar
- Role-based menu items

---

### STEP 2: Integrate Existing Pages

#### 2.1 Dashboard
**Create:** `app/(admin)/dashboard/page.tsx`
**Import from:** `pages/admin-dashboard`

#### 2.2 Articles
**Create:**
- `app/(admin)/articles/page.tsx` → ArticlesPage
- `app/(admin)/articles/new/page.tsx` → NewArticlePage
- `app/(admin)/articles/[id]/edit/page.tsx` → EditArticlePage (create)

#### 2.3 Drops
**Create:**
- `app/(admin)/drops/page.tsx` → DropsPage
- `app/(admin)/drops/new/page.tsx` → NewDropPage
- `app/(admin)/drops/[id]/page.tsx` → DropDetailPage (create)

#### 2.4 Orders
**Create:**
- `app/(admin)/orders/page.tsx` → OrdersPage
- `app/(admin)/orders/[id]/page.tsx` → OrderDetailPage

---

### STEP 3: Create Missing Pages

#### 3.1 Categories Management
**Create:**
```
pages/admin-categories/
├── ui/
│   ├── categories-page.tsx
│   ├── category-form.tsx
│   └── subcategory-form.tsx
├── model/
│   └── types.ts
└── index.ts

app/(admin)/categories/page.tsx
```

**Features:**
- List categories + subcategories (tree view)
- Add/edit/delete category
- Add/edit/delete subcategory
- Drag to reorder

---

#### 3.2 WhatsApp Groups Management
**Create:**
```
pages/admin-whatsapp-groups/
├── ui/
│   ├── groups-page.tsx
│   └── group-form.tsx
├── model/
│   └── types.ts
└── index.ts

app/(admin)/whatsapp-groups/page.tsx

features/whatsapp-group-list/
features/whatsapp-group-create/
```

**API Endpoints:**
```typescript
GET /api/whatsapp-groups
POST /api/whatsapp-groups
PUT /api/whatsapp-groups/:id
DELETE /api/whatsapp-groups/:id
GET /api/whatsapp-groups/sync (sync from WAHA)
```

**Features:**
- List WhatsApp groups
- Add group manually (name + wahaGroupId)
- Sync groups from WAHA API
- Edit group info
- Activate/deactivate group

---

#### 3.3 Site Settings (SUPER ADMIN ONLY)
**Create:**
```
pages/admin-settings/
├── ui/
│   ├── settings-page.tsx
│   ├── whatsapp-settings.tsx
│   ├── store-settings.tsx
│   ├── payment-settings.tsx
│   └── homepage-settings.tsx
├── model/
│   └── types.ts
└── index.ts

app/(admin)/settings/page.tsx

features/site-settings/
├── api/
│   └── settings-api.ts
└── lib/
    └── use-settings.ts
```

**API Endpoints:**
```typescript
GET /api/settings
PUT /api/settings (super admin only)
```

**Sections:**
1. **WhatsApp Settings**
   - WhatsApp group link
   - WAHA API URL
   - WAHA API Key
   - WAHA phone number

2. **Store Info**
   - Store name
   - Address
   - Hours
   - Support phone

3. **Payment Settings**
   - PawaPay API Key
   - Mode (test/production)
   - Enable MTN MoMo
   - Enable Orange Money

4. **Homepage Settings**
   - Title
   - Subtitle
   - Logo URL
   - Banner URL

5. **Ticket Settings**
   - Expiry days

---

#### 3.4 Team Management (SUPER ADMIN ONLY)
**Create:**
```
pages/admin-team/
├── ui/
│   ├── team-page.tsx
│   ├── invite-form.tsx
│   └── member-card.tsx
├── model/
│   └── types.ts
└── index.ts

app/(admin)/team/page.tsx

features/admin-team/
```

**API Endpoints:**
```typescript
GET /api/admins
POST /api/admins (invite)
PUT /api/admins/:id
DELETE /api/admins/:id (deactivate)
```

**Features:**
- List all admins
- Invite new admin (email + role)
- Change admin role
- Activate/deactivate admin
- View login history

---

## 🎨 ADMIN NAVIGATION MENU

```typescript
// Based on role
const navigation = [
  // Everyone
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Articles', href: '/admin/articles', icon: Package },
  { name: 'Drops', href: '/admin/drops', icon: Send },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  
  // Admin + Super Admin
  { name: 'Categories', href: '/admin/categories', icon: FolderTree, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'WhatsApp Groups', href: '/admin/whatsapp-groups', icon: Users, roles: ['ADMIN', 'SUPER_ADMIN'] },
  
  // Super Admin Only
  { name: 'Team', href: '/admin/team', icon: UserCog, roles: ['SUPER_ADMIN'] },
  { name: 'Settings', href: '/admin/settings', icon: Settings, roles: ['SUPER_ADMIN'] },
]
```

---

## 📝 IMPLEMENTATION ORDER

### Phase 1: Setup & Integration (Day 1-2)
1. ✅ Create `app/(admin)/layout.tsx` with auth
2. ✅ Create admin navigation component
3. ✅ Integrate dashboard page
4. ✅ Integrate articles pages
5. ✅ Integrate drops pages
6. ✅ Integrate orders pages

### Phase 2: New Pages (Day 3-4)
7. ✅ Create Categories page + API
8. ✅ Create WhatsApp Groups page + API
9. ✅ Create Site Settings page + API (priority!)
10. ✅ Create Team Management page + API

### Phase 3: Polish (Day 5)
11. ✅ Add role-based access control
12. ✅ Add breadcrumbs
13. ✅ Add page titles
14. ✅ Test all pages

---

## 🔐 ROLE-BASED ACCESS

```typescript
// middleware.ts or layout.tsx
function checkAccess(role: AdminRole, requiredRoles: AdminRole[]) {
  if (requiredRoles.includes('SUPER_ADMIN')) {
    return role === 'SUPER_ADMIN'
  }
  if (requiredRoles.includes('ADMIN')) {
    return ['ADMIN', 'SUPER_ADMIN'].includes(role)
  }
  return true // Everyone can access
}
```

---

## 🎯 NEXT IMMEDIATE STEPS

1. **NOW:** Create admin layout with auth check
2. **THEN:** Integrate existing 4 admin pages (dashboard, articles, drops, orders)
3. **AFTER:** Create missing 4 pages (categories, groups, settings, team)
4. **FINALLY:** Test everything

**Total Time:** ~3-5 days for complete admin implementation
