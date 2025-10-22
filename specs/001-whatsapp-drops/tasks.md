---
description: "Task list for DropInDrop WhatsApp e-commerce platform implementation"
---

# Tasks: DropInDrop - WhatsApp E-commerce Platform

**Input**: Design documents from `/specs/001-whatsapp-drops/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create entity-based directory structure per implementation plan in src/entities/
- [x] T002 Initialize Prisma schema with all entities from data-model.md in prisma/schema.prisma
- [x] T003 [P] Configure environment variables for WhatsApp, payments, and database in .env
- [x] T004 [P] Set up authentication middleware for role-based access in src/lib/middleware/auth-middleware.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Set up database schema and run Prisma migrations for all entities
- [x] T006 [P] Implement base entity classes and types in src/lib/domain/
- [x] T007 [P] Create shared utility functions for common operations in src/lib/utils.ts
- [x] T008 Configure WhatsApp WAHA service integration in src/entities/whatsapp/infrastructure/waha-client.ts
- [x] T009 Set up payment adapter service for easy provider replacement in src/lib/services/payment-service.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Super Admin First-Time Setup (Priority: P1) 🎯 MVP

**Goal**: Enable Super Admin to configure the DropInDrop platform on first login

**Independent Test**: Can be fully tested by completing the configuration wizard and verifying all settings are saved and the admin is redirected to the main dashboard

### Implementation for User Story 1

- [x] T010 [US1] Create User entity domain models and types in src/entities/user/domain/user.ts
- [x] T011 [P] [US1] Create configuration entity for platform settings in src/entities/configuration/domain/configuration.ts
- [x] T012 [US1] Implement configuration service for WhatsApp and payment setup in src/entities/configuration/domain/configuration-service.ts
- [x] T013 [US1] Create admin configuration API routes in src/app/api/admin/configuration/route.ts
- [x] T014 [US1] Build configuration wizard UI component in src/entities/configuration/presentation/configuration-wizard.tsx
- [x] T015 [US1] Create admin layout and navigation structure in src/app/admin/layout.tsx
- [x] T016 [US1] Implement first-time setup detection and redirection logic in src/lib/middleware/setup-middleware.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Product Management (Priority: P1)

**Goal**: Enable Admins to create, view, modify, and delete products with categories and photos

**Independent Test**: Can be fully tested by creating a product with all required fields, verifying it appears in the product list, modifying it, and then deleting it

### Implementation for User Story 2

- [x] T017 [US2] Create Product entity domain models and types in src/entities/product/domain/product.ts
- [x] T018 [P] [US2] Create Category entity for product organization in src/entities/category/domain/category.ts
- [x] T019 [US2] Implement product repository with CRUD operations in src/entities/product/domain/product-repository.ts
- [x] T020 [P] [US2] Implement category repository in src/entities/category/domain/category-repository.ts
- [x] T021 [US2] Create product service with business logic in src/entities/product/domain/product-service.ts
- [x] T022 [US2] Create category service in src/entities/category/domain/category-service.ts
- [x] T023 [US2] Build product management API routes in src/app/api/admin/products/route.ts
- [x] T024 [P] [US2] Build category management API routes in src/app/api/admin/categories/route.ts
- [x] T025 [US2] Create product management UI components in src/entities/product/presentation/product-management-page.tsx
- [x] T026 [P] [US2] Create category management UI in src/entities/category/presentation/category-management-page.tsx
- [x] T027 [US2] Implement product forms with validation in src/entities/product/presentation/product-forms.tsx
- [x] T028 [US2] Add image upload handling for products in src/lib/services/image-upload-service.ts analyse /home/pius-coder/project/did-v1/mvp-deprecated/image/index.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Drop Creation and WhatsApp Distribution (Priority: P1)

**Goal**: Enable Admins to create drops from selected products and send them to WhatsApp groups

**Independent Test**: Can be fully tested by creating a drop with multiple products, selecting WhatsApp groups, and sending the drop successfully

### Implementation for User Story 3

- [ ] T029 [US3] Create Drop entity domain models and types in src/entities/drop/domain/drop.ts
- [ ] T030 [P] [US3] Create WhatsApp Group entity in src/entities/whatsapp/domain/whatsapp-group.ts
- [ ] T031 [US3] Implement drop repository with CRUD operations in src/entities/drop/domain/drop-repository.ts
- [ ] T032 [P] [US3] Implement WhatsApp group repository in src/entities/whatsapp/domain/whatsapp-group-repository.ts
- [ ] T033 [US3] Create drop service with WhatsApp integration in src/entities/drop/domain/drop-service.ts
- [ ] T034 [US3] Create WhatsApp service using existing WAHA implementation in src/entities/whatsapp/domain/whatsapp-service.ts
- [ ] T035 [US3] Build drop management API routes in src/app/api/admin/drops/route.ts
- [ ] T036 [P] [US3] Build WhatsApp group management API routes in src/app/api/admin/whatsapp-groups/route.ts
- [ ] T037 [US3] Create calendar-based drop management UI in src/entities/drop/presentation/drop-calendar-page.tsx
- [ ] T038 [US3] Create WhatsApp group configuration UI in src/entities/whatsapp/presentation/whatsapp-config-component.tsx
- [ ] T039 [US3] Implement drop creation forms and product selection in src/entities/drop/presentation/drop-forms.tsx
- [ ] T040 [US3] Create WhatsApp message formatting service in src/entities/whatsapp/infrastructure/message-formatter.ts

**Checkpoint**: All P1 user stories should now be independently functional

---

## Phase 6: User Story 4 - Client Authentication via WhatsApp OTP (Priority: P1)

**Goal**: Enable Clients to authenticate using WhatsApp OTP when clicking product links

**Independent Test**: Can be fully tested by clicking a product link, completing the authentication form, receiving OTP via WhatsApp, and successfully logging in

### Implementation for User Story 4

- [ ] T041 [US4] Extend User entity with client-specific attributes in src/entities/user/domain/user.ts
- [ ] T042 [US4] Create OTP service for WhatsApp delivery in src/lib/services/otp-service.ts
- [ ] T043 [US4] Implement client authentication API routes in src/app/api/auth/client/send-otp/route.ts
- [ ] T044 [P] [US4] Implement OTP verification API routes in src/app/api/auth/client/verify-otp/route.ts
- [ ] T045 [US4] Create client authentication UI components in src/entities/user/presentation/client-auth-wrapper.tsx
- [ ] T046 [US4] Build OTP login form with WhatsApp integration in src/entities/user/presentation/client-otp-form.tsx
- [ ] T047 [US4] Implement authentication middleware for client routes in src/lib/middleware/client-auth-middleware.ts

---

## Phase 7: User Story 5 - Order Flow and Ticket Generation (Priority: P1)

**Goal**: Enable Clients to view product details, complete payment, and receive tickets with QR codes

**Independent Test**: Can be fully tested by viewing a product, completing payment, and receiving a ticket with both QR code and unique code for delivery verification

### Implementation for User Story 5

- [x] T048 [US5] Create Order entity domain models and types in src/entities/order/domain/order.ts
- [x] T049 [P] [US5] Create Ticket entity for delivery verification in src/entities/ticket/domain/ticket.ts
- [x] T050 [US5] Implement order repository with payment tracking in src/entities/order/domain/order-repository.ts
- [x] T051 [P] [US5] Implement ticket repository in src/entities/ticket/domain/ticket-repository.ts
- [x] T052 [US5] Create order service with payment processing in src/entities/order/domain/order-service.ts
- [x] T053 [P] [US5] Create ticket service with QR code generation in src/entities/ticket/domain/ticket-service.ts
- [x] T054 [US5] Build order creation API routes in src/app/api/orders/route.ts
- [x] T055 [P] [US5] Build public product viewing API routes in src/app/api/public/products/[id]/route.ts
- [x] T056 [US5] Create product detail page for clients in src/entities/product/presentation/product-detail-component.tsx
- [x] T057 [US5] Build payment processing UI with Stripe integration in src/entities/order/presentation/payment-page.tsx
- [x] T058 [US5] Create ticket display component with QR code in src/entities/ticket/presentation/ticket-display-component.tsx
- [x] T059 [US5] Implement QR code generation service in src/lib/services/qr-code-service.ts

---

## Phase 8: User Story 6 - Order Management for Admins (Priority: P2)

**Goal**: Enable Admins to view and manage all orders with filtering capabilities

**Independent Test**: Can be fully tested by viewing the orders list, applying filters by status and date, and accessing order details

### Implementation for User Story 6

- [ ] T060 [US6] Extend order service with admin management features in src/entities/order/domain/order-service.ts
- [ ] T061 [US6] Build admin order management API routes in src/app/api/admin/orders/route.ts
- [ ] T062 [US6] Create order management UI with filtering in src/entities/order/presentation/order-management-page.tsx
- [ ] T063 [US6] Implement order status update functionality in src/entities/order/presentation/order-status-components.tsx

---

## Phase 9: User Story 7 - Delivery Verification (Priority: P2)

**Goal**: Enable Delivery Managers to verify orders using QR codes or unique codes

**Independent Test**: Can be fully tested by generating a ticket with QR code, scanning it with the verification interface, and confirming delivery

### Implementation for User Story 7

- [ ] T064 [US7] Extend ticket service with verification logic in src/entities/ticket/domain/ticket-service.ts
- [ ] T065 [US7] Build ticket verification API routes in src/app/api/tickets/verify/route.ts
- [ ] T066 [US7] Create delivery verification UI with QR scanner in src/entities/ticket/presentation/delivery-verification-page.tsx
- [ ] T067 [US7] Implement QR code scanning component in src/entities/ticket/presentation/qr-scanner-component.tsx
- [ ] T068 [US7] Add manual code entry fallback in src/entities/ticket/presentation/manual-code-entry.tsx

---

## Phase 10: User Story 8 - User Management and Analytics (Priority: P2)

**Goal**: Enable Admins to view client information and purchase history

**Independent Test**: Can be fully tested by viewing the user list, selecting a user, and reviewing their complete purchase history and analytics

### Implementation for User Story 8

- [ ] T069 [US8] Extend user service with analytics capabilities in src/entities/user/domain/user-service.ts
- [ ] T070 [US8] Build user management API routes in src/app/api/admin/users/route.ts
- [ ] T071 [US8] Create user management UI with purchase history in src/entities/user/presentation/user-management-page.tsx
- [ ] T072 [US8] Implement analytics dashboard for view tracking in src/entities/product/presentation/analytics-dashboard.tsx

---

## Phase 11: User Story 9 - Advanced Drop Analytics (Priority: P3)

**Goal**: Enable Admins to track product view analytics and resend drops with filtered products

**Independent Test**: Can be fully tested by sending a drop, tracking views on individual products, and using the resend feature to create filtered drops

### Implementation for User Story 9

- [ ] T073 [US9] Extend drop service with analytics and resend logic in src/entities/drop/domain/drop-service.ts
- [ ] T074 [US9] Build drop analytics API routes in src/app/api/analytics/drops/performance/route.ts
- [ ] T075 [US9] Create advanced analytics UI components in src/entities/drop/presentation/drop-analytics-page.tsx
- [ ] T076 [US9] Implement drop resend functionality with product filtering in src/entities/drop/presentation/drop-resend-component.tsx

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T077 [P] Implement global error handling and logging in src/lib/services/error-service.ts
- [ ] T078 [P] Add loading states and error boundaries to all UI components
- [ ] T079 Optimize images and implement lazy loading in src/lib/services/image-optimization.ts
- [ ] T080 [P] Implement comprehensive input validation across all forms
- [ ] T081 [P] Add accessibility features and ARIA labels to all components
- [ ] T082 Performance optimization for mobile devices in src/lib/services/performance-service.ts
- [ ] T083 Update documentation and create API documentation in docs/api-reference.md
- [ ] T084 [P] Security hardening with rate limiting and input sanitization

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - May integrate with US2 (products) but should be independently testable
- **User Story 4 (P1)**: Can start after Foundational (Phase 2) - May integrate with US3 (drops) but should be independently testable
- **User Story 5 (P1)**: Can start after Foundational (Phase 2) - Depends on US2 (products) and US4 (authentication)
- **User Story 6 (P2)**: Can start after Foundational (Phase 2) - Depends on US5 (orders)
- **User Story 7 (P2)**: Can start after Foundational (Phase 2) - Depends on US5 (tickets)
- **User Story 8 (P2)**: Can start after Foundational (Phase 2) - Depends on US2 (products) and US5 (orders)
- **User Story 9 (P3)**: Can start after Foundational (Phase 2) - Depends on US3 (drops)

### Within Each User Story

- Domain models before services
- Services before API routes
- API routes before UI components
- Core implementation before integration features
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Within User Story 2: Product and Category entities can be developed in parallel
- Within User Story 3: Drop and WhatsApp Group entities can be developed in parallel
- Within User Story 5: Order and Ticket entities can be developed in parallel

---

## Parallel Example: User Story 2 (Product Management)

```bash
# Launch all domain models for User Story 2 together:
Task: "Create Product entity domain models and types in src/entities/product/domain/product.ts"
Task: "Create Category entity for product organization in src/entities/category/domain/category.ts"

# Launch all repositories for User Story 2 together:
Task: "Implement product repository with CRUD operations in src/entities/product/domain/product-repository.ts"
Task: "Implement category repository in src/entities/category/domain/category-repository.ts"

# Launch all services for User Story 2 together:
Task: "Create product service with business logic in src/entities/product/domain/product-service.ts"
Task: "Create category service in src/entities/category/domain/category-service.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Super Admin Setup)
   - Developer B: User Story 2 (Product Management)
   - Developer C: User Story 3 (Drop Creation)
   - Developer D: User Story 4 (Client Authentication)
   - Developer E: User Story 5 (Order Flow)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (if tests included)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
