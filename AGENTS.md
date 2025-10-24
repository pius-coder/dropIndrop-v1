# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Non-Obvious Project-Specific Conventions

### Authentication & Authorization

- **authMiddleware** returns `{user, response}`, not just user - check `response` first for auth failures
- Admin routes redirect to `/admin/configuration` if setup incomplete (checked via setupMiddleware)
- Default demo user created with phone `+237600000000` and email pattern `username@dropindrop.com`

### Domain Architecture

- All domain entities extend `BaseEntity` with `id`, `createdAt`, `updatedAt`
- Domain errors use custom classes: `DomainError`, `ValidationError`, `NotFoundError`, `ConflictError`
- Result pattern used: `{success: true, data: T} | {success: false, error: E}`

### Database & Prisma

- Prisma client globally cached in development to prevent connection limits
- Custom retry utility with exponential backoff uses `Math.pow(2, i)` not `2**i` (linting issue)
- Phone numbers stored without leading `+` sign but chat IDs use `+number@c.us` format
- WhatsApp chat IDs: groups end `@g.us`, individuals `@c.us`

### Path Aliases

- `@/*` maps to `./src/*` (standard Next.js setup)
- Very few imports actually use `@/` - most use relative paths

### Testing Framework

- No test directory structure found - tests may not exist yet or follow different pattern

### Environment Variables

- `DATABASE_URL` required for PostgreSQL connection
- WhatsApp integration needs `WAHA_API_KEY` and other WAHA-specific vars
