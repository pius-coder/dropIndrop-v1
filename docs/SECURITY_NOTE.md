# Security Notes

## Development Credentials

The seed file (`prisma/seed.ts`) contains hardcoded demo credentials for development:

```
admin@dropindrop.cm / Admin123!
manager@dropindrop.cm / Manager123!
```

⚠️ **These are for DEVELOPMENT ONLY**

### For Production:

1. **Never use these credentials** in production
2. **Use environment variables** for sensitive data
3. **Hash passwords properly** with bcrypt (not crypto.hash)
4. **Rotate credentials** regularly
5. **Use strong, random passwords**

### Recommended Approach:

```typescript
// Use environment variables
const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin123!";
const managerPassword = process.env.SEED_MANAGER_PASSWORD || "Manager123!";

// Use bcrypt for hashing
import bcrypt from "bcrypt";
const hashedPassword = await bcrypt.hash(password, 10);
```

### Droid Shield

Droid Shield correctly flags these as potential secrets. To commit:
1. Manually commit with awareness of the dev-only nature
2. Or modify seed script to use environment variables

## API Keys

All API keys should be in `.env` file (git-ignored):
- `WAHA_API_KEY`
- `PAWAPAY_API_KEY`
- `DATABASE_URL`

Never commit actual API keys to the repository.
