# Architect Mode Rules (Non-Obvious Only)

## Architecture Constraints

- Domain-driven design with clean separation: domain, presentation, infrastructure
- Entity inheritance from `BaseEntity` required across all domain models
- Result pattern `{success: true, data: T} | {success: false, error: E}` for all service methods
- Setup middleware enforces admin configuration completion before access

## Database Design

- WhatsApp chat ID format: groups `@g.us`, individuals `@c.us`
- Phone numbers stored without `+` prefix in database
- Prisma client global caching prevents connection pool exhaustion
- Foreign key relationships use explicit table names (not inferred)

## Security Architecture

- JWT authentication with custom middleware returning `{user, response}`
- Role-based access control with 4 user roles: SUPER_ADMIN, ADMIN, DELIVERY_MANAGER, CLIENT
- Admin routes protected and redirect to configuration if setup incomplete
- Demo user creation with predictable credentials for testing
