# Code Mode Rules (Non-Obvious Only)

## Coding Patterns

- Domain entities extend `BaseEntity` - all have `id`, `createdAt`, `updatedAt`
- Service methods return `Result<T, E>` pattern: `{success: true, data: T} | {success: false, error: E}`
- Custom error classes: `DomainError`, `ValidationError`, `NotFoundError`, `ConflictError`
- Import types with `import type` for better tree-shaking (Biome lints this)

## Database & Prisma

- Phone numbers stored without `+` prefix but WhatsApp chat IDs use `+number@c.us`
- Prisma client globally cached in dev via `globalForPrisma` pattern
- WhatsApp groups: `@g.us`, individuals: `@c.us`

## Authentication

- `authMiddleware` returns `{user, response}` - always check `response` first
- Setup middleware redirects incomplete admin setup to `/admin/configuration`

## Path Aliases

- `@/` maps to `./src/*` but rarely used - prefer relative imports
- Import Prisma types as `import { UserRole } from "@prisma/client"`

## Utilities

- Retry function uses `Math.pow(2, i)` instead of `2**i` (explicit linting rule)
- Validation errors include field names for better UX
