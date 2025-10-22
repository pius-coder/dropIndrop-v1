# Data Model: DropInDrop WhatsApp E-commerce Platform

## Overview

This document defines the data model for the DropInDrop platform, organized by business entities following the entity-based architecture pattern. Each entity includes its attributes, relationships, and business rules.

## Entity Definitions

### 1. User Entity

**Purpose**: Manages all platform users with role-based access control

**Attributes**:

- `id`: UUID, Primary Key
- `username`: String(50), Unique, Required
- `email`: String(255), Optional (for notifications)
- `phoneNumber`: String(20), Required, Unique
- `passwordHash`: String(255), Required
- `role`: Enum (SUPER_ADMIN, ADMIN, DELIVERY_MANAGER, CLIENT), Required
- `isActive`: Boolean, Default: true
- `createdAt`: Timestamp, Required
- `updatedAt`: Timestamp, Required
- `lastLoginAt`: Timestamp, Optional

**Business Rules**:

- Phone number must include country code
- Password hash must be bcrypt with salt rounds >= 12
- Role determines available permissions and UI access

**Relationships**:

- One-to-many: Orders (as customer)
- One-to-many: Orders (as admin who processed)
- Many-to-many: WhatsApp Groups (as admin/manager)

### 2. Category Entity

**Purpose**: Organizes products hierarchically for better management

**Attributes**:

- `id`: UUID, Primary Key
- `name`: String(100), Required
- `description`: Text, Optional
- `parentId`: UUID, Foreign Key to Category (self-referencing), Optional
- `sortOrder`: Integer, Default: 0
- `isActive`: Boolean, Default: true
- `createdAt`: Timestamp, Required
- `updatedAt`: Timestamp, Required

**Business Rules**:

- Categories can have subcategories (self-referencing)
- Maximum depth of 3 levels (Category → Subcategory → Sub-subcategory)
- Inactive categories hide all child products

**Relationships**:

- One-to-many: Products
- Self-referencing: Parent/Child Categories

### 3. Product Entity

**Purpose**: Represents items available for sale in drops

**Attributes**:

- `id`: UUID, Primary Key
- `name`: String(200), Required
- `description`: Text, Required
- `price`: Decimal(10,2), Required, Min: 0
- `sku`: String(50), Unique, Optional
- `categoryId`: UUID, Foreign Key to Category, Required
- `images`: JSON Array of URLs, Required (min 1 image)
- `isActive`: Boolean, Default: true
- `stockQuantity`: Integer, Default: 0 (unlimited if 0)
- `viewCount`: Integer, Default: 0
- `createdAt`: Timestamp, Required
- `updatedAt`: Timestamp, Required

**Business Rules**:

- Price must be greater than 0
- At least one image required
- SKU must be unique across all products
- View count automatically incremented on product page visits

**Relationships**:

- Many-to-one: Category
- Many-to-many: Drops (through DropProduct junction table)
- One-to-many: Order Items

### 4. Drop Entity

**Purpose**: Collections of products scheduled for WhatsApp distribution

**Attributes**:

- `id`: UUID, Primary Key
- `name`: String(200), Optional
- `scheduledDate`: Timestamp, Required
- `status`: Enum (DRAFT, SCHEDULED, SENT, CANCELLED), Default: DRAFT
- `sentAt`: Timestamp, Optional
- `messageId`: String(100), Optional (WAHA message ID)
- `createdBy`: UUID, Foreign Key to User, Required
- `createdAt`: Timestamp, Required
- `updatedAt`: Timestamp, Required

**Business Rules**:

- Scheduled date must be in the future when status is SCHEDULED
- Status automatically set to SENT when WhatsApp message is sent
- Only DRAFT drops can be modified

**Relationships**:

- Many-to-one: Created By User
- Many-to-many: Products (through DropProduct junction table)
- Many-to-many: WhatsApp Groups (through DropGroup junction table)
- One-to-many: Orders (drops that were active when order was placed)

### 5. WhatsApp Group Entity

**Purpose**: Manages WhatsApp groups for drop distribution

**Attributes**:

- `id`: UUID, Primary Key
- `name`: String(100), Required
- `chatId`: String(50), Required, Unique (WhatsApp group ID format)
- `description`: Text, Optional
- `isActive`: Boolean, Default: true
- `memberCount`: Integer, Optional (updated periodically)
- `createdAt`: Timestamp, Required
- `updatedAt`: Timestamp, Required

**Business Rules**:

- chatId format: `{groupId}@g.us`
- Only active groups can receive drops
- Member count should be updated before major drop sends

**Relationships**:

- Many-to-many: Drops (through DropGroup junction table)
- Many-to-many: Users (admins who can send to this group)

### 6. Order Entity

**Purpose**: Tracks customer purchases and payment status

**Attributes**:

- `id`: UUID, Primary Key
- `orderNumber`: String(20), Unique, Required (auto-generated)
- `customerId`: UUID, Foreign Key to User, Required
- `status`: Enum (PENDING, PAID, DELIVERED, CANCELLED), Default: PENDING
- `totalAmount`: Decimal(10,2), Required
- `paymentIntentId`: String(100), Optional (Stripe payment intent ID)
- `paidAt`: Timestamp, Optional
- `deliveredAt`: Timestamp, Optional
- `deliveredBy`: UUID, Foreign Key to User, Optional
- `notes`: Text, Optional
- `createdAt`: Timestamp, Required
- `updatedAt`: Timestamp, Required

**Business Rules**:

- Order number format: `ORD-{YYYYMMDD}-{sequence}`
- Total amount calculated from order items
- Status progression: PENDING → PAID → DELIVERED
- Payment intent ID required when status is PAID

**Relationships**:

- Many-to-one: Customer User
- Many-to-one: Delivered By User (optional)
- One-to-many: Order Items
- One-to-one: Ticket (when paid)

### 7. Order Item Entity

**Purpose**: Individual products within an order (junction table)

**Attributes**:

- `id`: UUID, Primary Key
- `orderId`: UUID, Foreign Key to Order, Required
- `productId`: UUID, Foreign Key to Product, Required
- `quantity`: Integer, Required, Min: 1
- `unitPrice`: Decimal(10,2), Required (snapshot of price at time of order)
- `totalPrice`: Decimal(10,2), Required (quantity × unitPrice)

**Business Rules**:

- Quantity must be >= 1
- Unit price is snapshot of product price at order time
- Total price = quantity × unitPrice

**Relationships**:

- Many-to-one: Order
- Many-to-one: Product

### 8. Ticket Entity

**Purpose**: Delivery verification with QR codes and unique codes

**Attributes**:

- `id`: UUID, Primary Key
- `orderId`: UUID, Foreign Key to Order, Required
- `qrCodeData`: Text, Required (encrypted order verification data)
- `uniqueCode`: String(10), Required, Unique
- `isUsed`: Boolean, Default: false
- `usedAt`: Timestamp, Optional
- `usedBy`: UUID, Foreign Key to User, Optional
- `expiresAt`: Timestamp, Required (24 hours after creation)
- `createdAt`: Timestamp, Required

**Business Rules**:

- Unique code format: `{4 letters}-{4 digits}`
- QR code contains encrypted order ID and verification token
- Ticket expires 24 hours after creation
- Can only be used once

**Relationships**:

- One-to-one: Order
- Many-to-one: Used By User (optional)

## Junction Tables

### DropProduct (Drop ↔ Product)

- `dropId`: UUID, Foreign Key to Drop
- `productId`: UUID, Foreign Key to Product
- `sortOrder`: Integer, Default: 0

### DropGroup (Drop ↔ WhatsApp Group)

- `dropId`: UUID, Foreign Key to Drop
- `groupId`: UUID, Foreign Key to WhatsApp Group

### UserWhatsAppGroup (User ↔ WhatsApp Group)

- `userId`: UUID, Foreign Key to User
- `groupId`: UUID, Foreign Key to WhatsApp Group

## Indexes and Performance

### Critical Indexes

- `users(phoneNumber)` - For quick OTP verification
- `products(categoryId, isActive)` - For product listing by category
- `drops(scheduledDate, status)` - For calendar view and scheduling
- `orders(customerId, createdAt)` - For customer order history
- `orders(status, createdAt)` - For admin order management
- `tickets(uniqueCode)` - For quick ticket verification
- `tickets(qrCodeData)` - For QR code verification

### Composite Indexes

- `products(categoryId, isActive, viewCount)` - For popular products in category
- `drops(scheduledDate, status, sentAt)` - For drop analytics and resending
- `orders(status, paidAt, deliveredAt)` - For order lifecycle tracking

## Data Validation Rules

### User Creation

- Phone number must match international format: `+{country code}{number}`
- Username must be 3-50 characters, alphanumeric + underscore
- Password must be >= 8 characters with mixed case and numbers

### Product Creation

- Name must be 5-200 characters
- Price must be > 0 and <= 999999.99
- At least one image URL required
- Category must exist and be active

### Drop Creation

- Must include at least one product
- Scheduled date must be >= current time
- WhatsApp groups must exist and be active

### Order Processing

- Total amount must match sum of order items
- Payment intent ID required for PAID status
- Customer must have active account

## State Transitions

### Drop States

```
DRAFT → SCHEDULED (when scheduled date set)
SCHEDULED → SENT (when WhatsApp message sent)
SENT → CANCELLED (admin action)
DRAFT → CANCELLED (admin action)
```

### Order States

```
PENDING → PAID (when payment confirmed)
PAID → DELIVERED (when ticket verified)
PAID → CANCELLED (admin action or refund)
```

### Ticket States

```
CREATED → USED (when verified by delivery manager)
CREATED → EXPIRED (when expiresAt reached)
```

## Security Considerations

### Sensitive Data

- `passwordHash`: bcrypt hashed with salt
- `qrCodeData`: AES-256 encrypted with app secret
- `paymentIntentId`: Stored securely, logged appropriately

### Access Control

- Super Admins: Full access to all entities
- Admins: Read/write access to products, drops, orders, users
- Delivery Managers: Read access to orders and tickets, write access to delivery verification
- Clients: Read access to own orders and tickets

## Migration Strategy

### Initial Schema

1. Create all entities with basic attributes
2. Establish foreign key relationships
3. Create indexes for performance
4. Set up Row Level Security (RLS) policies

### Data Seeding

1. Create default Super Admin user
2. Create sample categories (Electronics, Fashion, etc.)
3. Set up initial WhatsApp groups (if any)

### Future Enhancements

- Add product variants (size, color, etc.)
- Implement product reviews and ratings
- Add delivery tracking with location data
- Support for promotional codes and discounts
