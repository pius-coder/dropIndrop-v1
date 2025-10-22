# Feature Specification: DropInDrop - WhatsApp E-commerce Platform

**Feature Branch**: `001-whatsapp-drops`
**Created**: 2025-10-17
**Status**: Draft
**Input**: User description: "DropInDrop - Plan détaillé du projet A mobile first app using shadcn component , architecture where you regroup files per entity no per files name or type, ## Vue d'ensemble DropInDrop est une plateforme e-commerce qui gère les ventes exclusivement via WhatsApp. Les produits sont regroupés en "drops" et envoyés dans des groupes WhatsApp. Les clients commandent via des liens, et l'administration se fait via une interface web."

## Clarifications

### Session 2025-10-18

- Q: What is the relationship between Drop and Product entities? → A: One Drop can contain multiple Products, and each Product can be in multiple Drops (many-to-many)
- Q: What is the relationship between Order and Product entities? → A: one order contain one product
- Q: What is the relationship between User and Order entities? → A: One User can have multiple Orders, but each Order belongs to only one User (one-to-many)
- Q: What is the relationship between Order and Ticket entities? → A: One Order can have one Ticket, and each Ticket belongs to only one Order (one-to-one)
- Q: What is the relationship between Drop and WhatsApp Group entities? → A: One Drop can be sent to multiple WhatsApp Groups, and each WhatsApp Group can receive multiple Drops (many-to-many)
- Q: What happens when resending an existing drop? → A: When resending an existing drop, a verification phase checks if the articles in the drop are available or not, then creates a new drop based on the previous one, a derived status is set, and only available articles are sent, so resending an existing drop creates a new one

## User Scenarios & Testing _(mandatory)_

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Super Admin First-Time Setup (Priority: P1)

As a Super Admin, I need to configure the DropInDrop platform on first login so that the system is ready for operational use with proper WhatsApp and payment settings.

**Why this priority**: This is the foundational setup that must be completed before any other functionality can work. Without proper configuration, no drops can be sent or orders processed.

**Independent Test**: Can be fully tested by completing the configuration wizard and verifying all settings are saved and the admin is redirected to the main dashboard.

**Acceptance Scenarios**:

1. **Given** Super Admin accesses the platform for the first time, **When** they log in, **Then** they are automatically redirected to the configuration page
2. **Given** Super Admin is on the configuration page, **When** they fill out general information, WhatsApp settings, and payment configuration, **Then** all settings are validated and saved
3. **Given** configuration is completed and saved, **When** Super Admin submits the form, **Then** they are redirected to the main admin interface

---

### User Story 2 - Product Management (Priority: P1)

As an Admin, I need to create, view, modify, and delete products with categories and photos so that I can maintain the product catalog for drops.

**Why this priority**: Products are the core inventory of the system. Without product management, no drops can be created, making this essential for any e-commerce functionality.

**Independent Test**: Can be fully tested by creating a product with all required fields, verifying it appears in the product list, modifying it, and then deleting it.

**Acceptance Scenarios**:

1. **Given** Admin accesses the product management section, **When** they click "Create Product", **Then** a form appears with fields for name, description, price, photos, category, and subcategory
2. **Given** Admin fills out the product form completely, **When** they submit the form, **Then** the product is saved and appears in the product list
3. **Given** a product exists in the list, **When** Admin clicks "Modify", **Then** the form is pre-populated with existing data for editing
4. **Given** a product exists, **When** Admin clicks "Delete", **Then** they see a confirmation dialog and the product is removed from the system

---

### User Story 3 - Drop Creation and WhatsApp Distribution (Priority: P1)

As an Admin, I need to create drops from selected products and send them to WhatsApp groups so that customers can discover and purchase products.

**Why this priority**: This is the core business functionality - creating and distributing product drops via WhatsApp is the primary way customers interact with the platform.

**Independent Test**: Can be fully tested by creating a drop with multiple products, selecting WhatsApp groups, and sending the drop successfully.

**Acceptance Scenarios**:

1. **Given** Admin has products in the system, **When** they select multiple products and click "Create Drop", **Then** a drop is created containing those products
2. **Given** a drop exists, **When** Admin clicks "Send to WhatsApp", **Then** they see a list of configured WhatsApp groups to select from
3. **Given** Admin selects WhatsApp groups and sends a drop, **When** the send process completes, **Then** the drop is distributed to selected groups and timestamp is recorded

---

### User Story 4 - Client Authentication via WhatsApp OTP (Priority: P1)

As a Client, I need to authenticate using WhatsApp OTP when clicking product links so that I can make purchases securely.

**Why this priority**: Authentication is required for the order flow. Without this, customers cannot make purchases, which is core to the business model.

**Independent Test**: Can be fully tested by clicking a product link, completing the authentication form, receiving OTP via WhatsApp, and successfully logging in.

**Acceptance Scenarios**:

1. **Given** Client clicks a product link from WhatsApp, **When** they are not authenticated, **Then** they are redirected to the login page
2. **Given** Client fills out the authentication form with username, password, and phone number, **When** they submit, **Then** an OTP code is sent via WhatsApp
3. **Given** Client receives OTP code, **When** they enter it correctly, **Then** their account is created/accessed and they proceed to payment

---

### User Story 5 - Order Flow and Ticket Generation (Priority: P1)

As a Client, I need to view product details, complete payment, and receive a ticket with QR code so that I can complete my purchase and prepare for delivery.

**Why this priority**: This is the core conversion flow - from product interest to completed purchase with delivery verification method.

**Independent Test**: Can be fully tested by viewing a product, completing payment, and receiving a ticket with both QR code and unique code for delivery verification.

**Acceptance Scenarios**:

1. **Given** Client is authenticated and viewing a product, **When** they click "Purchase", **Then** they see product details, price, and payment options
2. **Given** Client selects a payment method and completes payment, **When** payment is confirmed, **Then** a ticket is generated with unique QR code and text code
3. **Given** ticket is generated, **When** the process completes, **Then** the ticket is displayed to the client and sent via WhatsApp

---

### User Story 6 - Order Management for Admins (Priority: P2)

As an Admin, I need to view and manage all orders with filtering capabilities so that I can track sales and handle customer service.

**Why this priority**: Important for business operations and customer service, but not required for the initial MVP launch.

**Independent Test**: Can be fully tested by viewing the orders list, applying filters by status and date, and accessing order details.

**Acceptance Scenarios**:

1. **Given** Admin accesses the orders section, **When** the page loads, **Then** they see all orders with client name, products, amount, date, and status
2. **Given** multiple orders exist, **When** Admin applies filters by status or date, **Then** only matching orders are displayed
3. **Given** an order is selected, **When** Admin clicks for details, **Then** they see complete order information including customer details

---

### User Story 7 - Delivery Verification (Priority: P2)

As a Delivery Manager, I need to verify orders using QR codes or unique codes so that I can confirm deliveries accurately.

**Why this priority**: Essential for delivery operations, but can be handled manually initially while the core ordering system is established.

**Independent Test**: Can be fully tested by generating a ticket with QR code, scanning it with the verification interface, and confirming delivery.

**Acceptance Scenarios**:

1. **Given** Delivery Manager accesses the verification interface, **When** they scan a QR code from a client ticket, **Then** order details are displayed for verification
2. **Given** order details are displayed, **When** Delivery Manager confirms the delivery, **Then** the order status is updated to "delivered"
3. **Given** Delivery Manager doesn't have QR scanner access, **When** they enter a unique code manually, **Then** the same verification process occurs

---

### User Story 8 - User Management and Analytics (Priority: P2)

As an Admin, I need to view client information and purchase history so that I can understand customer behavior and provide better service.

**Why this priority**: Valuable for business intelligence and customer relationship management, but not critical for initial launch.

**Independent Test**: Can be fully tested by viewing the user list, selecting a user, and reviewing their complete purchase history and analytics.

**Acceptance Scenarios**:

1. **Given** Admin accesses the user management section, **When** the page loads, **Then** they see all registered clients with name, phone, registration date, and order count
2. **Given** a client is selected, **When** Admin views their details, **Then** they see complete purchase history including amounts and dates
3. **Given** product view tracking is enabled, **When** Admin views product analytics, **Then** they see view counts and popularity metrics

---

### User Story 9 - Advanced Drop Analytics (Priority: P3)

As an Admin, I need to track product view analytics and resend drops with filtered products so that I can optimize future drops based on performance data.

**Why this priority**: Nice-to-have feature for optimization, but not essential for the core business functionality.

**Independent Test**: Can be fully tested by sending a drop, tracking views on individual products, and using the resend feature to create filtered drops.

**Acceptance Scenarios**:

1. **Given** a drop is sent to WhatsApp groups, **When** clients click product links, **Then** view counts are automatically recorded for each product
2. **Given** a drop has been sent previously, **When** Admin chooses to resend it, **Then** the system analyzes which products were purchased and creates a new drop with only unsold items
3. **Given** view analytics are available, **When** Admin views drop or product details, **Then** they see view counts and engagement metrics

### Edge Cases

- **WhatsApp connectivity issues**: What happens when WhatsApp API is unavailable during OTP sending or drop distribution?
- **Payment gateway failures**: How does the system handle incomplete payments and ensure data consistency?
- **QR code scanning failures**: What happens when QR codes cannot be scanned due to damaged codes or camera issues?
- **Concurrent drop management**: How does the system handle multiple admins trying to send the same drop simultaneously?
- **Large product catalog**: What happens when admins need to manage hundreds of products in categories?
- **Network timeouts**: How does the system handle slow network connections during product photo uploads or drop sending?
- **Invalid phone numbers**: What happens when clients provide incorrect phone numbers during registration?
- **Expired OTP codes**: How does the system handle OTP codes that expire before client can enter them?
- **Duplicate orders**: What happens when clients accidentally submit multiple orders for the same product?
- **Calendar conflicts**: How does the system handle scheduling multiple drops for the same date/time?

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST allow Super Admin to configure platform settings including general information, WhatsApp configuration, and payment settings on first login
- **FR-002**: System MUST provide product CRUD operations (Create, Read, Update, Delete) with support for name, description, price, photos, categories, and subcategories
- **FR-003**: System MUST allow creation of product drops by selecting multiple products and assigning them to calendar dates
- **FR-004**: System MUST integrate with WhatsApp API to send drops to configured groups and track message delivery status
- **FR-005**: System MUST implement OTP authentication via WhatsApp for client registration and login
- **FR-006**: System MUST process payments and generate unique tickets with QR codes and text codes for order verification
- **FR-007**: System MUST provide calendar-based interface for managing drops with Google Calendar-style date navigation
- **FR-008**: System MUST track product view analytics when clients click product links from WhatsApp
- **FR-009**: System MUST allow delivery managers to verify orders using QR code scanning or manual code entry
- **FR-010**: System MUST provide admin interfaces for order management with filtering by status, date, and product
- **FR-011**: System MUST support role-based access control for Super Admin, Admin, Delivery Manager, and Client roles
- **FR-012**: System MUST enable drop resending with automatic filtering of sold vs unsold products (creates new drop with derived status, only available articles sent)
- **FR-013**: System MUST send tickets to clients via WhatsApp after successful payment
- **FR-014**: System MUST provide user management interface showing client purchase history and analytics
- **FR-015**: System MUST support mobile-first responsive design for all interfaces

### Key Entities _(include if feature involves data)_

- **User**: Represents all platform users with role-based access (Super Admin, Admin, Delivery Manager, Client), including authentication details and contact information (one-to-many relationship with Order)
- **Product**: Represents items for sale with name, description, price, photos, category, subcategory, and view tracking metrics
- **Drop**: Represents collections of products scheduled for WhatsApp distribution, linked to specific dates and containing product references (many-to-many relationship with Product)
- **Order**: Represents customer purchases with payment status, timestamps, and relationships to users and products (one-to-one relationship with Product)
- **Ticket**: Represents delivery verification method with unique QR codes and text codes, linked to specific orders (one-to-one relationship with Order)
- **WhatsApp Group**: Represents configured WhatsApp groups for drop distribution with contact information and settings (many-to-many relationship with Drop)
- **Category**: Represents product organization hierarchy with subcategories for better product management

## Success Criteria _(mandatory)_

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Super Admin can complete initial platform configuration in under 5 minutes including WhatsApp and payment settings
- **SC-002**: Admins can create and send a product drop to WhatsApp groups within 2 minutes of product selection
- **SC-003**: Clients can complete authentication via WhatsApp OTP and make a purchase within 3 minutes of clicking a product link
- **SC-004**: 95% of WhatsApp drop messages are successfully delivered to target groups within 30 seconds
- **SC-005**: Delivery managers can verify orders using QR codes or manual codes in under 15 seconds per transaction
- **SC-006**: System supports up to 100 concurrent users during peak drop release times without performance degradation
- **SC-007**: 90% of clients successfully complete their first purchase after clicking a WhatsApp product link
- **SC-008**: Admins can filter and find specific orders within 10 seconds using the order management interface
