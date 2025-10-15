# 🚀 Drop-In-Drop V1

WhatsApp E-commerce Platform for Cameroon

## 🏗️ Architecture

**Feature-Sliced Design** + **Vertical Slices** + **Clean Architecture**

### 📁 Project Structure

```
├── app/           # Routing, layouts, API routes
├── pages/         # Complete pages
├── widgets/       # Complex UI blocks
├── features/      # User actions (create, update, delete)
├── entities/      # Business objects (article, drop, order)
└── shared/        # Reusable utilities (ui, api, lib, store)
```

### 🎯 Principles

- **Co-locate logic that change together**
- **Group code by feature, not by type**
- **Separate UI, logic, and data fetching**
- **Type-safety across the whole stack**
- **Pure functions for business logic**
- **Clear boundaries between layers**

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL

### Installation

1. Clone and setup:
```bash
cd ~/project/did-v1
pnpm install
```

2. Setup database:
```bash
# Edit .env with your database URL
cp .env.example .env

# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed database (optional)
pnpm db:seed
```

3. Run development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📦 Tech Stack

### Frontend
- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Query** - Data fetching & caching
- **React Hook Form** - Form handling
- **Zod** - Validation

### Backend
- **Hono** - Fast API framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **WAHA** - WhatsApp API
- **PawaPay** - Payment gateway

## 🧪 Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript check

pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Prisma Studio
pnpm db:seed      # Seed database
```

## 📚 Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [API Documentation](./docs/API.md)

## 🤝 Contributing

Please read our [Contributing Guide](./CONTRIBUTING.md)

## 📄 License

MIT
