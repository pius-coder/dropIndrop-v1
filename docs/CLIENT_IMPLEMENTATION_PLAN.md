# 🚀 CLIENT FEATURES - FULL IMPLEMENTATION PLAN

> **Project Type:** WhatsApp-First Selling Platform (NOT traditional e-commerce)  
> **Focus:** Client/Customer experience for buying via WhatsApp drops

---

## 📊 GAP ANALYSIS

### ✅ What Exists (Database & Admin APIs)
- Database schema complete (SiteSettings, Customer, Order, WhatsAppGroup)
- Admin APIs: Auth, Articles, Drops, Orders (20 endpoints)
- Basic homepage component

### ❌ What's Missing (ALL Client Features)

| Feature | Status | Priority |
|---------|--------|----------|
| **Customer OTP Authentication** | ❌ 0% | 🔴 Critical |
| **WAHA WhatsApp Integration** | ❌ 0% | 🔴 Critical |
| **Public Article Pages** | ❌ 0% | 🔴 Critical |
| **Purchase Flow (OTP → Pay)** | ❌ 0% | 🔴 Critical |
| **PawaPay Payment Integration** | ❌ 0% | 🔴 Critical |
| **Customer Ticket Viewing** | ❌ 0% | 🟡 High |
| **Customer Dashboard** | ❌ 0% | 🟡 High |
| **Site Settings Admin UI** | ❌ 0% | 🟡 High |
| **Drop Sending (WAHA)** | ❌ 0% | 🟢 Medium |
| **Public Homepage** | 🟡 20% | 🟢 Medium |

---

## 🎯 IMPLEMENTATION ROADMAP

### **PHASE 1: Customer Authentication (Week 1-2)**

#### 1.1 Customer OTP System
**API Endpoints to Create:**
```typescript
POST /api/customers/send-otp
POST /api/customers/verify-otp
GET /api/customers/me
POST /api/customers/logout
```

**Files to Create:**
```
features/customer-auth/
├── model/
│   └── types.ts (OTP schemas, session types)
├── api/
│   ├── customer-auth-api.ts (client calls)
│   └── server.ts (OTP generation, validation)
├── lib/
│   ├── otp-utils.ts (generate 6-digit code, expiry)
│   └── use-customer-auth.ts (React hook)
└── ui/
    ├── otp-login-form.tsx
    └── otp-verify-form.tsx

app/api/routes/
└── customers.ts (new route file)

shared/store/
└── customer-store.ts (Zustand for customer session)
```

**Logic:**
1. Customer enters phone + name
2. System generates 6-digit code (expires 5 min)
3. Send code via WAHA WhatsApp API
4. Customer enters code
5. System validates → creates session token
6. Store in localStorage (30 days)

---

#### 1.2 WAHA Integration (OTP Sending)
**Files to Create:**
```
lib/waha/
├── client.ts (WAHA API wrapper)
├── types.ts (message types)
└── templates.ts (OTP message template)
```

**Integration:**
```typescript
// lib/waha/client.ts
export async function sendOTPViaWhatsApp(phone: string, code: string) {
  const settings = await getSiteSettings()
  
  const response = await fetch(`${settings.wahaApiUrl}/api/sendText`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${settings.wahaApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chatId: `${phone}@c.us`,
      text: `🔐 Drop-In-Drop\n\nVotre code: ${code}\n\nExpire dans 5 min.`
    })
  })
  
  return response.json()
}
```

**Environment Variables:**
- Already in `.env.example`: `WAHA_API_URL`, `WAHA_API_KEY` ✅

---

### **PHASE 2: Public Pages & Purchase Flow (Week 3-4)**

#### 2.1 Public Article Page
**Route:** `app/a/[uniqueSlug]/page.tsx`

**Files to Create:**
```
app/a/[uniqueSlug]/
└── page.tsx (public article view)

features/article-public/
├── ui/
│   ├── article-public-view.tsx
│   ├── article-gallery.tsx
│   └── buy-now-button.tsx
└── lib/
    └── use-public-article.ts
```

**Features:**
- Photo gallery (swipeable)
- Video player (if exists)
- Price, stock, description
- "Acheter" button
- Share buttons (WhatsApp, copy link)
- Analytics tracking (views, clicks)

---

#### 2.2 Purchase Flow
**Routes:**
```
app/buy/[articleId]/page.tsx - Purchase confirmation
app/buy/success/page.tsx - Order success + ticket
```

**Files to Create:**
```
features/customer-purchase/
├── model/
│   └── types.ts
├── api/
│   └── customer-purchase-api.ts
├── lib/
│   └── use-purchase.ts
└── ui/
    ├── purchase-confirm.tsx
    ├── payment-method-select.tsx
    └── purchase-success.tsx
```

**Flow:**
```
1. Click "Acheter"
   ↓
2. Check if authenticated
   - NO → Show OTP login
   - YES → Continue
   ↓
3. Confirm order
   ↓
4. Select payment method (MTN/Orange)
   ↓
5. Process payment (PawaPay)
   ↓
6. Generate ticket
   ↓
7. Show ticket + send via WhatsApp
```

---

#### 2.3 PawaPay Integration
**Files to Create:**
```
lib/pawapay/
├── client.ts (PawaPay API wrapper)
├── types.ts
├── mtn-momo.ts
├── orange-money.ts
└── webhook.ts

app/api/routes/
└── payments.ts (webhook handler)

app/api/webhooks/pawapay/
└── route.ts (Next.js webhook route)
```

**Payment Flow:**
```typescript
// Initiate payment
POST /api/payments/initiate
{
  orderId: string
  paymentMethod: "MTN_MOMO" | "ORANGE_MONEY"
  phone: string
  amount: number
}

// Webhook callback
POST /api/webhooks/pawapay
{
  transactionId: string
  status: "COMPLETED" | "FAILED"
  orderId: string
}

// Check status
GET /api/payments/status/:orderId
```

**Integration Steps:**
1. User confirms payment
2. System calls PawaPay API (initiate)
3. Customer receives push notification on phone
4. Customer enters PIN
5. PawaPay sends webhook to our server
6. Update order status → generate ticket
7. Send ticket via WhatsApp

---

### **PHASE 3: Customer Dashboard & Tickets (Week 5)**

#### 3.1 Customer Ticket Viewing
**Routes:**
```
app/client/tickets/page.tsx - All tickets
app/ticket/[code]/page.tsx - Single ticket (public)
```

**Files to Create:**
```
features/customer-tickets/
├── model/
│   └── types.ts
├── api/
│   └── customer-tickets-api.ts
├── lib/
│   └── use-customer-tickets.ts
└── ui/
    ├── ticket-list.tsx
    ├── ticket-card.tsx
    └── ticket-detail.tsx

features/ticket-public/
└── ui/
    └── ticket-public-view.tsx (QR code, download)
```

**Features:**
- List all customer tickets
- Active vs expired
- QR code display
- Download ticket (PDF/image)
- Share ticket link

---

#### 3.2 Customer Dashboard
**Route:** `app/client/page.tsx`

**Files to Create:**
```
pages/client-dashboard/
├── ui/
│   ├── dashboard-page.tsx
│   ├── stats-cards.tsx
│   ├── recent-orders.tsx
│   └── quick-actions.tsx
└── model/
    └── use-dashboard-stats.ts
```

**Features:**
- Total orders
- Active tickets count
- Member since
- Recent orders (3 last)
- Quick actions (tickets, support, logout)

---

### **PHASE 4: Site Settings & Configuration (Week 6)**

#### 4.1 Site Settings Admin UI
**Route:** `app/admin/settings/page.tsx`

**Files to Create:**
```
features/site-settings/
├── model/
│   └── types.ts (settings schemas)
├── api/
│   ├── settings-api.ts
│   └── server.ts
├── lib/
│   └── use-settings.ts
└── ui/
    ├── settings-page.tsx
    ├── whatsapp-settings.tsx
    ├── store-settings.tsx
    ├── payment-settings.tsx
    └── homepage-settings.tsx

app/api/routes/
└── settings.ts (CRUD for settings)
```

**API Endpoints:**
```typescript
GET /api/settings - Get current settings
PUT /api/settings - Update settings (super admin only)
```

**Sections:**
1. WhatsApp (WAHA config, group link, phone)
2. Store Info (name, address, hours, support)
3. Payments (PawaPay keys, methods enabled)
4. Homepage (title, subtitle, logo, banner)
5. Tickets (expiry days)

---

### **PHASE 5: Drop Sending via WAHA (Week 7-8)**

#### 5.1 WAHA Drop Sending
**Files to Create/Modify:**
```
lib/waha/
├── send-drop.ts (send article to group)
├── send-media.ts (send images/videos)
└── rate-limiter.ts (delay between sends)

features/drop-send/
└── lib/
    └── send-to-whatsapp.ts (orchestrator)
```

**Drop Sending Logic:**
```typescript
For each group:
  For each article:
    1. Send image 1 (no caption)
    2. Wait 30-60s
    3. Send image 2 (no caption)  
    4. Wait 30-60s
    5. If video exists: Send video
    6. Wait 30-60s
    7. Send last image with message
    8. Wait 60-120s
  Wait 5-10 min before next group
```

**Message Template:**
```
🛍️ *{{PRODUCT_NAME}}*

💰 *Prix:* {{PRICE}} FCFA
📦 *Stock:* {{STOCK}} disponibles

{{DESCRIPTION}}

🔗 *Voir & Acheter:* {{LINK}}

💳 Paiement Mobile Money
🚚 Retrait gratuit

#DropInDrop
```

---

### **PHASE 6: Enhanced Homepage (Week 9)**

#### 6.1 Public Homepage Redesign
**Route:** `app/page.tsx`

**Updates to:**
```
pages/client-home/ui/home-page.tsx
```

**Features:**
1. Dynamic content from SiteSettings
2. WhatsApp group CTA button
3. How it works section
4. Store info footer
5. Featured products (optional)

---

## 📝 DETAILED FILE STRUCTURE

```
app/
├── a/[uniqueSlug]/page.tsx ← PUBLIC ARTICLE
├── buy/
│   ├── [articleId]/page.tsx ← PURCHASE FLOW
│   └── success/page.tsx ← SUCCESS + TICKET
├── client/
│   ├── page.tsx ← DASHBOARD
│   ├── tickets/page.tsx ← MY TICKETS
│   └── orders/page.tsx ← ORDER HISTORY
├── ticket/[code]/page.tsx ← PUBLIC TICKET VIEW
├── admin/
│   └── settings/page.tsx ← SITE SETTINGS (NEW)
└── api/
    ├── routes/
    │   ├── customers.ts ← NEW (OTP, auth)
    │   ├── payments.ts ← NEW (PawaPay)
    │   └── settings.ts ← NEW
    └── webhooks/
        └── pawapay/route.ts ← NEW

features/
├── customer-auth/ ← NEW
├── customer-purchase/ ← NEW
├── customer-tickets/ ← NEW
├── ticket-public/ ← NEW
├── site-settings/ ← NEW
└── drop-send/ (enhance with WAHA)

lib/
├── waha/ ← NEW
│   ├── client.ts
│   ├── send-drop.ts
│   └── templates.ts
└── pawapay/ ← NEW
    ├── client.ts
    ├── mtn-momo.ts
    └── orange-money.ts

shared/
└── store/
    └── customer-store.ts ← NEW (customer session)
```

---

## 🔧 TECHNICAL REQUIREMENTS

### New Dependencies
```json
{
  "qrcode": "^1.5.3",
  "qrcode.react": "^3.1.0",
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1"
}
```

### Environment Variables (already in .env.example ✅)
```bash
WAHA_API_URL="http://localhost:3001"
WAHA_API_KEY="your-waha-api-key"
PAWAPAY_API_KEY="your-pawapay-api-key"
PAWAPAY_MODE="test"
```

---

## 🎯 PRIORITY ORDER (What to Build First)

### **🔴 CRITICAL (Must Have for MVP)**
1. Customer OTP Authentication (Week 1-2)
2. WAHA Integration for OTP (Week 1-2)
3. Public Article Pages (Week 3)
4. Purchase Flow (Week 3-4)
5. PawaPay Integration (Week 4)
6. Ticket Viewing (Week 5)

### **🟡 HIGH (Important but can wait)**
7. Customer Dashboard (Week 5)
8. Site Settings UI (Week 6)
9. Enhanced Homepage (Week 9)

### **🟢 MEDIUM (Nice to Have)**
10. Drop Sending via WAHA (Week 7-8)
11. Article Analytics Tracking
12. Admin Team Management UI

---

## ⏱️ TIME ESTIMATES

| Phase | Duration | Effort |
|-------|----------|--------|
| Phase 1: Customer Auth + WAHA | 2 weeks | 60-80 hours |
| Phase 2: Public Pages + Purchase | 2 weeks | 60-80 hours |
| Phase 3: Dashboard + Tickets | 1 week | 30-40 hours |
| Phase 4: Site Settings | 1 week | 30-40 hours |
| Phase 5: Drop Sending | 2 weeks | 50-60 hours |
| Phase 6: Homepage | 1 week | 20-30 hours |
| **TOTAL** | **9 weeks** | **250-330 hours** |

---

## ✅ ACCEPTANCE CRITERIA

### **Customer Can:**
- ✅ See article shared in WhatsApp group
- ✅ Click link → view article page
- ✅ Click "Buy" → authenticate with OTP
- ✅ Select payment method
- ✅ Pay via MTN/Orange Money
- ✅ Receive ticket on WhatsApp
- ✅ View ticket in browser
- ✅ Show QR code at store
- ✅ See order history

### **Admin Can:**
- ✅ Configure WAHA settings
- ✅ Configure payment methods
- ✅ Update store info
- ✅ Create drops
- ✅ Send drops to WhatsApp
- ✅ Scan tickets
- ✅ Validate pickups

---

## 🚨 CRITICAL DEPENDENCIES

1. **WAHA Instance** (WhatsApp API)
   - Must be running on VPS
   - Must have phone number connected
   - API must be accessible

2. **PawaPay Account**
   - Merchant account setup
   - API keys obtained
   - Webhook URL configured

3. **Site Settings**
   - Must be configured before customers can use
   - Super admin must set up on first login

---

## 📚 NEXT STEPS

1. **Immediate:** Implement Customer OTP Authentication
2. **Week 1:** WAHA integration for sending OTP
3. **Week 2:** Public article pages
4. **Week 3:** Purchase flow
5. **Week 4:** PawaPay integration
6. **Week 5:** Ticket system
7. **Week 6+:** Dashboard, settings, enhancements

---

**TOTAL NEW ENDPOINTS TO CREATE: ~15**
**TOTAL NEW UI PAGES: ~10**
**TOTAL NEW FEATURES: ~6 major**

This represents approximately **9 weeks of full-time development** to complete all client-facing features.
