# Implementation Plan: DropInDrop - WhatsApp E-commerce Platform

**Branch**: `001-whatsapp-drops` | **Date**: 2025-10-17 | **Spec**: [specs/001-whatsapp-drops/spec.md](specs/001-whatsapp-drops/spec.md)
**Input**: Feature specification from `/specs/001-whatsapp-drops/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

DropInDrop is a mobile-first WhatsApp e-commerce platform that enables product sales exclusively through WhatsApp. The platform supports multiple user roles (Super Admin, Admin, Delivery Manager, Client) with features including product management, drop creation, WhatsApp integration for notifications and OTP authentication, payment processing with QR code ticket generation, and delivery verification. Technical implementation will use Next.js/React frontend with TypeScript, PostgreSQL database via Prisma ORM, shadcn/ui components, and WhatsApp Business API integration, organized in an entity-based file structure.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.0 (aligned with existing Next.js project)
**Primary Dependencies**: Next.js 15.5, React 19.1, Prisma ORM, shadcn/ui components, Tailwind CSS v4
**Storage**: PostgreSQL with Prisma ORM (existing project database)
**Testing**: Jest, React Testing Library, Playwright for E2E testing
**Target Platform**: Web browsers (Chrome, Safari, Firefox) with mobile-first responsive design
**Project Type**: Single web application with entity-based architecture
**Performance Goals**: <2s page load times, support for 1000 concurrent users, <100ms API response times
**Constraints**: WhatsApp Business API rate limits, mobile-first design requirements, QR code scanning compatibility across devices
**Scale/Scope**: Support for 10+ admins, 1000+ products, 10k+ orders, real-time WhatsApp messaging

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Core Principles Validation:**

- **Test-First (NON-NEGOTIABLE)**: Implementation MUST follow TDD - tests written → user approved → tests fail → implement. Red-Green-Refactor cycle strictly enforced.
- **Integration Testing**: Focus areas requiring integration tests: new library contracts, contract changes, inter-service communication, shared schemas.
- **Clean Code**: Code must be readable, maintainable, self-documenting; DRY principles, meaningful naming, consistent formatting.
- **Library-First**: Every feature starts as standalone library; must be self-contained, independently testable, documented.
- **CLI Interface**: Every library exposes functionality via CLI; text in/out protocol: stdin/args → stdout, errors → stderr.
- **UI/UX Principles** (if applicable): Open Code, Composition, Distribution, Beautiful Defaults, AI-Ready Design must be considered for frontend features.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

Entity-based architecture organizing files by business domain rather than technical type:

```
src/
├── entities/
│   ├── user/
│   │   ├── domain/
│   │   │   ├── user.ts
│   │   │   ├── user-repository.ts
│   │   │   └── user-service.ts
│   │   ├── presentation/
│   │   │   ├── user-management-page.tsx
│   │   │   ├── user-profile-component.tsx
│   │   │   └── user-forms.tsx
│   │   └── infrastructure/
│   │       ├── user-api-routes.ts
│   │       └── user-database.ts
│   │
│   ├── product/
│   │   ├── domain/
│   │   │   ├── product.ts
│   │   │   ├── product-repository.ts
│   │   │   └── product-service.ts
│   │   ├── presentation/
│   │   │   ├── product-management-page.tsx
│   │   │   ├── product-detail-component.tsx
│   │   │   └── product-forms.tsx
│   │   └── infrastructure/
│   │       ├── product-api-routes.ts
│   │       └── product-database.ts
│   │
│   ├── drop/
│   │   ├── domain/
│   │   │   ├── drop.ts
│   │   │   ├── drop-repository.ts
│   │   │   └── drop-service.ts
│   │   ├── presentation/
│   │   │   ├── drop-calendar-page.tsx
│   │   │   ├── drop-detail-component.tsx
│   │   │   └── drop-forms.tsx
│   │   └── infrastructure/
│   │       ├── whatsapp-integration.ts
│   │       └── drop-api-routes.ts
│   │
│   ├── order/
│   │   ├── domain/
│   │   │   ├── order.ts
│   │   │   ├── order-repository.ts
│   │   │   └── order-service.ts
│   │   ├── presentation/
│   │   │   ├── order-management-page.tsx
│   │   │   └── order-components.tsx
│   │   └── infrastructure/
│   │       └── order-api-routes.ts
│   │
│   ├── ticket/
│   │   ├── domain/
│   │   │   ├── ticket.ts
│   │   │   └── ticket-service.ts
│   │   ├── presentation/
│   │   │   ├── ticket-display-component.tsx
│   │   │   └── qr-code-component.tsx
│   │   └── infrastructure/
│   │       └── ticket-generation.ts
│   │
│   └── whatsapp/
│       ├── domain/
│       │   ├── whatsapp-service.ts
│       │   └── whatsapp-types.ts
│       ├── presentation/
│       │   └── whatsapp-config-component.tsx
│       └── infrastructure/
│           └── whatsapp-api-client.ts
│
├── lib/
│   ├── utils.ts
│   ├── middleware/
│   │   └── auth-middleware.ts
│   └── hooks/
│       ├── useAuth.ts
│       └── useClientAuth.ts
│
└── components/
    ├── ui/                    # shadcn/ui components
    ├── forms/                 # Reusable form components
    └── layout/                # Layout components

tests/
├── entities/
│   ├── user/
│   ├── product/
│   ├── drop/
│   ├── order/
│   └── ticket/
├── integration/
└── e2e/
```

**Structure Decision**: Entity-based architecture chosen to align with business domains and support the "regroup files per entity" requirement. Each entity contains domain logic (business rules), presentation layer (UI components), and infrastructure concerns (API routes, database access). This structure promotes high cohesion within entities and loose coupling between them, following Domain-Driven Design principles while maintaining compatibility with Next.js App Router structure.

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
