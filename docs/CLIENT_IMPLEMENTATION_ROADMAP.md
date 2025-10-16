# 🚀 CLIENT IMPLEMENTATION ROADMAP

## Principle: Small, Incremental, Testable Steps

Each step follows the EPCT cycle:
1. **EXAMINE** → Document current state and requirements
2. **PLAN** → Define specific implementation tasks
3. **CODE** → Implement following best practices
4. **COMMIT** → Save progress and move to next step

---

## 📋 CURRENT STATE ANALYSIS

### ✅ What EXISTS (Admin-Focused)
- **Complete Admin Backend**: Articles, Drops, Orders, Auth APIs
- **Database Schema**: Customer, Order, Article entities ready
- **Basic Client Homepage**: Article browsing, search functionality
- **WAHA Integration**: WhatsApp messaging system

### ❌ What is MISSING (Client Features)
- **Customer OTP Authentication**: No WhatsApp OTP system
- **Purchase Flow**: No "Buy Now" functionality
- **Ticket Management**: No QR code generation or viewing
- **Payment Integration**: No Mobile Money processing
- **Client Dashboard**: No order history or stats

---

## 🎯 CLIENT IMPLEMENTATION PHASES

### **Phase 1: Foundation & Authentication**
#### **Step 1: Customer OTP API** (2 hours)
```
docs/features/client-01-otp-auth/
entities/customer/
  ├── model/
  │   ├── types.ts              # OTP schemas, customer types
  │   └── utils.ts              # Phone validation, OTP generation
  ├── api/
  │   ├── otp-api.ts            # Send/verify OTP endpoints
  │   └── customer-api.ts       # Customer CRUD
  └── lib/
      └── hooks.ts              # useCustomer, useOTP hooks
```

**Context7 Analysis:**
- WhatsApp OTP patterns (WAHA integration)
- Phone number validation (Cameroon format: +237)
- Session management (JWT vs cookies)

**Prisma Schema Analysis:**
```typescript
Customer {
  id: string @default(cuid())
  phone: string @unique        // WhatsApp number
  name: string
  // No password - OTP only
}
```

**Implementation:**
- POST `/api/customers/send-otp` - Send 6-digit code via WhatsApp
- POST `/api/customers/verify-otp` - Verify code, create session
- GET `/api/customers/me` - Get customer profile

---

#### **Step 2: Customer Entity** (1 hour)
```
entities/customer/
  ├── model/
  │   ├── types.ts              # Customer schemas
  │   └── utils.ts              # Customer utilities
  ├── api/
  │   └── customer-api.ts       # Customer operations
  └── ui/
      └── customer-profile.tsx  # Profile management
```

**Key Functions:**
- `validatePhoneNumber()` - Cameroon phone format
- `generateOTP()` - 6-digit secure code
- `createCustomerSession()` - JWT token creation

---

#### **Step 3: OTP Login UI** (1.5 hours)
```
pages/(client)/auth/
  ├── otp-request.tsx           # Phone number input
  ├── otp-verify.tsx            # Code verification
  └── layout.tsx                # Auth layout
```

**What it does:**
- Phone number input with validation
- WhatsApp OTP sending
- Code verification with countdown
- Session creation and redirect

---

### **Phase 2: Purchase Flow**
#### **Step 4: Article Purchase API** (2 hours)
```
docs/features/client-02-purchase/
entities/order/
  ├── model/
  │   ├── purchase-types.ts     # Purchase schemas
  │   └── ticket-utils.ts       # QR code generation
  ├── api/
  │   ├── purchase-api.ts       # Create order endpoint
  │   └── ticket-api.ts         # Ticket operations
  └── lib/
      └── payment.ts            # Payment processing
```

**Context7 Analysis:**
- E-commerce purchase patterns
- QR code generation (qrcode.js)
- Payment flow integration

**Prisma Schema Analysis:**
```typescript
Order {
  customerId: string
  articleId: string
  ticketCode: string @unique   // Human-readable
  ticketQRCode: string         // QR code data URL
}
```

**Implementation:**
- POST `/api/customers/orders` - Create order with ticket
- GET `/api/customers/tickets/:code` - Get ticket details

---

#### **Step 5: Article Detail Page** (1.5 hours)
```
pages/(client)/articles/[slug]/
  ├── page.tsx                  # Article detail view
  ├── purchase-modal.tsx        # Buy button modal
  └── components/
      ├── image-carousel.tsx    # Photo gallery
      └── purchase-form.tsx     # Buy form
```

**What it displays:**
- Article photos (carousel)
- Price, description, stock
- "Buy Now" button
- WhatsApp share button

---

#### **Step 6: Purchase Flow UI** (2 hours)
```
pages/(client)/purchase/
  ├── page.tsx                  # Purchase confirmation
  ├── payment.tsx               # Payment method selection
  └── success.tsx               # Order confirmation
```

**Purchase Flow:**
1. Article selection → Customer auth → Payment → Ticket generation

---

### **Phase 3: Ticket Management**
#### **Step 7: Ticket API** (1 hour)
```
features/ticket-management/
  ├── api/
  │   └── ticket-api.ts         # Ticket CRUD operations
  ├── model/
  │   └── ticket-types.ts       # Ticket schemas
  └── lib/
      └── qr-generator.ts       # QR code utilities
```

**Context7 Analysis:**
- QR code generation patterns
- Ticket validation systems
- Expiration handling

**Key Functions:**
- `generateTicketCode()` - Human-readable codes (TKT-ABC123)
- `generateQRCode()` - QR code for ticket
- `validateTicket()` - Check validity and expiration

---

#### **Step 8: Ticket UI** (1.5 hours)
```
pages/(client)/tickets/
  ├── page.tsx                  # Ticket list
  ├── [code]/
  │   └── page.tsx              # Ticket detail view
  └── components/
      ├── ticket-card.tsx       # Ticket display
      └── qr-display.tsx        # QR code component
```

**What it displays:**
- Active tickets list
- QR code for pickup
- Ticket expiration countdown
- Share ticket functionality

---

### **Phase 4: Client Dashboard**
#### **Step 9: Client Dashboard** (1.5 hours)
```
pages/(client)/dashboard/
  ├── page.tsx                  # Main dashboard
  ├── orders.tsx                # Order history
  └── profile.tsx               # Profile management
```

**What it displays:**
- Order statistics (total spent, order count)
- Active tickets
- Recent orders
- Profile management

---

### **Phase 5: Payment Integration**
#### **Step 10: Mobile Money Integration** (3 hours)
```
lib/payment/
  ├── providers/
  │   ├── mtn-momo.ts           # MTN integration
  │   └── orange-money.ts       # Orange integration
  ├── pawapay.ts                # Payment processor
  └── webhooks.ts               # Payment status updates
```

**Context7 Analysis:**
- Mobile Money API patterns (MTN, Orange)
- Webhook handling for payment status
- Retry mechanisms for failed payments

**Integration Points:**
- WAHA for payment notifications
- PawaPay API integration
- Database payment status updates

---

### **Phase 6: Polish & Testing**
#### **Step 11: Error Handling** (1 hour)
```
components/ui/
  ├── error-boundary.tsx        # React error boundaries
  ├── loading-states.tsx        # Loading components
  └── toast-manager.tsx         # Toast notifications
```

#### **Step 12: Mobile Optimization** (1 hour)
```
components/
  ├── responsive/
  │   └── mobile-first.tsx     # Mobile layouts
  └── touch/
      └── gestures.tsx          # Touch interactions
```

#### **Step 13: Performance** (1 hour)
```
lib/
  ├── caching/
  │   └── client-cache.ts       # Client-side caching
  └── optimization/
      └── image-optimization.ts # Image loading
```

---

## 📊 IMPLEMENTATION TIMELINE

| Phase | Steps | Estimated Time | Status |
|-------|-------|----------------|---------|
| **Phase 1** | Foundation & Auth | 4.5 hours | 🔄 In Progress |
| **Phase 2** | Purchase Flow | 6 hours | ⏳ Pending |
| **Phase 3** | Ticket Management | 2.5 hours | ⏳ Pending |
| **Phase 4** | Client Dashboard | 1.5 hours | ⏳ Pending |
| **Phase 5** | Payment Integration | 3 hours | ⏳ Pending |
| **Phase 6** | Polish & Testing | 3 hours | ⏳ Pending |

**TOTAL: 20.5 hours** (vs 15-20 hours estimated)

---

## 🚨 CRITICAL DEPENDENCIES

### **External Services**
- **WAHA**: WhatsApp messaging for OTP
- **PawaPay**: Mobile Money processing
- **QR Code Library**: Ticket QR generation

### **Database Entities**
- **Customer**: Phone, name, session management
- **Order**: Customer orders with tickets
- **SiteSettings**: WAHA config, payment settings

---

## 🎯 SUCCESS CRITERIA

### **MVP Complete When:**
- ✅ Customer can browse articles
- ✅ Customer can authenticate via WhatsApp OTP
- ✅ Customer can purchase articles
- ✅ Customer receives ticket with QR code
- ✅ Customer can view tickets and order history
- ✅ Admin can validate tickets for pickup

### **Technical Metrics:**
- ✅ All TypeScript errors resolved
- ✅ API response times < 500ms
- ✅ Mobile-first responsive design
- ✅ Proper error handling and loading states

---

## 📝 NEXT STEPS

**STARTING NOW:**
1. **Step 1**: Customer OTP API implementation
2. **Step 2**: Customer entity setup
3. **Step 3**: OTP login UI

**COMMIT AFTER EACH STEP** to maintain incremental progress.

---

## 🔍 CONTEXT7 ANALYSIS TOPICS

For each step, analyze:
- **Authentication patterns**: JWT vs session cookies
- **Payment flow patterns**: Mobile Money integration
- **QR code patterns**: Generation and validation
- **Real-time updates**: WebSocket for order status
- **Mobile optimization**: Touch interactions, responsive design

---

## 🏗️ ARCHITECTURE DECISIONS

### **Client Authentication**
- **OTP via WhatsApp** (no passwords)
- **Session-based** (React context + localStorage)
- **JWT tokens** for API authentication

### **Payment Flow**
- **WAHA integration** for payment notifications
- **PawaPay API** for Mobile Money processing
- **Webhook handling** for payment status updates

### **Ticket System**
- **QR codes** for offline validation
- **Expiration dates** (configurable)
- **Unique ticket codes** (TKT-ABC123 format)

---

**Ready to implement Step 1: Customer OTP API**
