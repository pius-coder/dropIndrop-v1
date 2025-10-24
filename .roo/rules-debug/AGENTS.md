# Debug Mode Rules (Non-Obvious Only)

## Debugging Challenges

- Database push may fail without running PostgreSQL server locally
- WhatsApp integration requires `WAHA_API_KEY` environment variable
- Admin setup redirects to `/admin/configuration` if incomplete
- Demo user phone: `+237600000000`, email: `username@dropindrop.com`

## Environment Setup

- PostgreSQL connection requires `DATABASE_URL` environment variable
- Prisma client caching may mask connection issues in development
- WAHA API integration needs specific environment variables
