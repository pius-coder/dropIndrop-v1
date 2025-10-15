# Context7 Analysis: Order Entity

## Overview
Order entity handles the complete purchase flow: customer orders article, pays via mobile money (MTN/Orange), receives ticket with QR code, and picks up item.

## Key Components

### 1. Payment Integration (MTN Mobile Money & Orange Money)

**Payment Flow:**
```
Customer → Select Article → Enter Phone/Name
    ↓
Choose Payment Method (MTN/Orange)
    ↓
System generates Order (status: PENDING)
    ↓
Redirect to Payment Gateway (PawaPay)
    ↓
Payment Success → Generate Ticket
    ↓
Send Ticket via WhatsApp → Customer
```

**Best Practices:**
- Always validate payment status before generating ticket
- Store transaction IDs for reconciliation
- Handle payment failures gracefully
- Timeout after 15 minutes if unpaid

### 2. Ticket Generation

**Requirements:**
- Unique ticket code (format: TKT-YYYYMMDD-XXXX)
- QR code containing ticket data
- Expiry date (7 days default)
- Customer info and article details

**QR Code Best Practices:**
Based on research:
- Use `qrcode` npm package (zero dependencies, 14KB)
- Generate as base64 data URL or PNG
- Error correction level: M (medium) for balance
- Include: ticketCode, orderId, customerPhone

**Library Choice:** `qrcode` package
```bash
npm install qrcode @types/qrcode
```

### 3. Ticket Validation

**Validation Rules:**
- Ticket must exist
- Not expired
- Not already picked up
- Payment status = PAID
- Article still in stock

**Pickup Flow:**
```
Admin scans QR code → System validates ticket
    ↓
Valid → Mark as PICKED_UP
    ↓
Decrement article stock
    ↓
Record pickup time and validator
```

---

## Order Entity Structure

### Types & Validation

**Order Statuses:**
- Payment: PENDING, PAID, FAILED, REFUNDED
- Pickup: PENDING, PICKED_UP, CANCELLED

**Zod Schemas:**
1. `createOrderSchema` - Customer order creation
2. `validateTicketSchema` - Ticket validation
3. `orderFilterSchema` - Order filtering

### Utility Functions

**Payment Utils:**
- `validatePaymentMethod()` - Check MTN/Orange
- `formatPhoneForPayment()` - Format for gateway
- `calculateAmount()` - Price with potential fees

**Ticket Utils:**
- `generateTicketCode()` - TKT-YYYYMMDD-XXXX
- `generateQRCode(data)` - QR code as base64
- `isTicketExpired()` - Check expiry
- `canPickup()` - Validate pickup eligibility

**Order Utils:**
- `getOrderStatus()` - Combined status text
- `isPaymentPending()` - Check payment
- `isReadyForPickup()` - Check pickup eligibility

---

## Mobile-First Considerations

### Customer View (Mobile)
- Simple order form (article, phone, name)
- Large payment buttons (MTN/Orange)
- Clear ticket display with QR code
- Easy-to-scan QR code (min 200x200px)

### Admin View (Mobile)
- QR scanner component
- Quick validation interface
- Success/error feedback
- Pickup confirmation

---

## Security Considerations

### Payment
- Never store payment credentials
- Use HTTPS for payment redirects
- Validate callback signatures
- Rate limit order creation

### Tickets
- QR codes contain encrypted/signed data
- Server-side validation always
- Track validation attempts (prevent brute force)
- Auto-expire after pickup

---

## Implementation Plan

1. **Model Layer** (`entities/order/model/`)
   - Types for Order, Payment, Ticket
   - Zod schemas for validation
   - Status enums

2. **Lib Layer** (`entities/order/lib/`)
   - `order-utils.ts` - Order status helpers
   - `payment-utils.ts` - Payment validation
   - `ticket-utils.ts` - Ticket generation & validation

3. **API Layer** (`entities/order/api/`)
   - CRUD operations
   - Payment initiation
   - Ticket validation
   - Pickup confirmation

---

## Testing Strategy

### Unit Tests
```typescript
describe("generateTicketCode", () => {
  it("should match format TKT-YYYYMMDD-XXXX", () => {
    const code = generateTicketCode();
    expect(code).toMatch(/^TKT-\d{8}-\d{4}$/);
  });
});

describe("canPickup", () => {
  it("should reject unpaid orders", () => {
    const order = { paymentStatus: "PENDING", pickupStatus: "PENDING" };
    expect(canPickup(order)).toBe(false);
  });
  
  it("should reject expired tickets", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const order = { 
      paymentStatus: "PAID", 
      ticketExpiresAt: yesterday 
    };
    expect(canPickup(order)).toBe(false);
  });
});
```

---

## Summary

**Order entity provides:**
- Complete payment flow (MTN/Orange)
- Ticket generation with QR codes
- Validation & pickup workflow
- Mobile-first design
- Security best practices

**Next:** Implement Order entity following this analysis.
