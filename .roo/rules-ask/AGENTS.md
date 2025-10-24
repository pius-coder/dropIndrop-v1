# Ask Mode Rules (Non-Obvious Only)

## Project Context

- WhatsApp e-commerce platform for product drops and delivery tracking
- Uses WAHA API for WhatsApp integration
- PostgreSQL database with Prisma ORM
- Domain-driven design with entities in `src/entities/`

## Architecture Overview

- Next.js 15 with TypeScript and Tailwind CSS
- Clean architecture: domain, presentation, infrastructure layers
- Result pattern for error handling across services
- JWT authentication with role-based access (SUPER_ADMIN, ADMIN, DELIVERY_MANAGER, CLIENT)

## Key Features

- Product drops sent to WhatsApp groups
- QR code-based delivery verification
- Admin configuration wizard for initial setup
- Payment integration with multiple providers
