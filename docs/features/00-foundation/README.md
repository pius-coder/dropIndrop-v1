# Feature 00: Foundation Setup

## Overview
Setting up the shared infrastructure for the application following Feature-Sliced Design architecture.

## Goals
1. Create shared API client wrapper
2. Configure React Query for server state
3. Setup Zustand stores for client state
4. Establish type-safe patterns
5. Create reusable utilities

## Implementation Checklist
- [ ] shared/api/client.ts - HTTP client with auth
- [ ] shared/api/query-client.ts - React Query config
- [ ] shared/store/auth-store.ts - Authentication state
- [ ] shared/store/ui-store.ts - UI state (modals, toasts)
- [ ] shared/lib/utils.ts - Common utilities
- [ ] shared/config/env.ts - Environment configuration

## Dependencies Verified
✓ @tanstack/react-query
✓ zustand
✓ zod
✓ @hono/zod-validator
