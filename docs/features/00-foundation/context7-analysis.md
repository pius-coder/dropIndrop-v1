# Context7 Analysis: Foundation Setup

## TanStack React Query Best Practices

### 1. QueryClient Setup for Next.js (SSR)

**Key Pattern:**
```typescript
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 60s to prevent immediate refetch after SSR
      },
    },
  })
}

// Server: always create new client
// Browser: singleton pattern
let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    return makeQueryClient()
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}
```

**Why:**
- Server: Each request gets fresh client (no data leakage)
- Browser: Single instance prevents React re-initialization on suspense
- staleTime: Avoids refetch immediately after hydration

### 2. Provider Setup

**Pattern:**
```typescript
'use client'

export default function Providers({ children }) {
  const queryClient = getQueryClient()
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

**Best Practices:**
- Mark as 'use client' (uses useContext)
- Don't use useState if suspense boundary not present
- Use getQueryClient() for proper SSR handling

### 3. Query Usage Pattern

```typescript
const query = useQuery({ 
  queryKey: ['todos'], 
  queryFn: getTodos 
})

const mutation = useMutation({
  mutationFn: postTodo,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  }
})
```

**Key Principles:**
- QueryKey: Array for cache identification
- Invalidate on mutation success
- Use type-safe query keys

---

## Zustand Best Practices

### 1. Type-Safe Store with Persist

**Pattern:**
```typescript
interface AuthState {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      isAuthenticated: () => !!get().token
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
```

**Best Practices:**
- Define interface for type safety
- Use curried syntax `create<T>()(persist(...))`
- Unique name for each persisted store
- Group state and actions in one interface

### 2. Partial Persistence

```typescript
export const useStore = create<State>()(
  persist(
    (set) => ({
      context: { /* persisted */ },
      temp: { /* not persisted */ },
    }),
    {
      name: 'my-storage',
      partialize: (state) => ({ context: state.context })
    }
  )
)
```

**When to use:**
- Persist only essential data
- Exclude temporary UI state
- Reduce localStorage size

### 3. Manual Hydration

```typescript
const store = createStore<State>()(
  persist(
    (set) => ({ /* ... */ }),
    {
      name: 'position-storage',
      skipHydration: true
    }
  )
)

// Later, manually trigger
store.persist.rehydrate()
```

**Use case:**
- Control when state is loaded
- Wait for authentication
- Async initialization

---

## Implementation Plan for Drop-In-Drop

### 1. Shared API Client (`shared/api/client.ts`)

**Features:**
- Type-safe HTTP wrapper
- Auto-attach auth token
- Error handling
- Base URL configuration

**Structure:**
```typescript
class ApiClient {
  private baseURL: string
  private getToken: () => string | null
  
  async request<T>(method, url, data?): Promise<T>
  get<T>(url): Promise<T>
  post<T>(url, data): Promise<T>
  put<T>(url, data): Promise<T>
  delete<T>(url): Promise<T>
}
```

### 2. React Query Setup (`shared/api/query-client.ts`)

**Configuration:**
- 60s staleTime (SSR optimization)
- 1 retry on failure
- Global error handling
- SSR-safe client initialization

### 3. Zustand Stores

**Auth Store (`shared/store/auth-store.ts`):**
- user, token
- login, logout, isAuthenticated
- Persist to localStorage

**UI Store (`shared/store/ui-store.ts`):**
- Modal state
- Toast notifications
- Loading states
- NOT persisted (temporary)

### 4. Environment Config (`shared/config/env.ts`)

**Safe access to env variables:**
```typescript
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_APP_URL,
  wahaUrl: process.env.WAHA_API_URL,
  // Type-safe access, throws if missing required vars
}
```

---

## Mobile-First Considerations

### Shadcn UI Integration

**Strategy:**
- Use shadcn components for mobile-responsive design
- Tailwind CSS v4 with mobile-first breakpoints
- Touch-friendly interactions (min 44px tap targets)
- Bottom navigation for mobile
- Drawer patterns instead of modals on small screens

**Responsive Patterns:**
```tsx
// Desktop: Sidebar + Main
// Mobile: Bottom Nav + Full Screen

<div className="md:flex">
  <aside className="hidden md:block">Sidebar</aside>
  <main className="flex-1">Content</main>
  <nav className="fixed bottom-0 md:hidden">Mobile Nav</nav>
</div>
```

### Performance

- Lazy load routes
- Image optimization (next/image)
- Suspense boundaries
- React Query caching reduces network requests

---

## Testing Strategy

### Pure Functions (Easy to Test)
```typescript
// shared/lib/format.ts
export function formatPrice(amount: number) { ... }

// Easy to test - no dependencies
expect(formatPrice(1000)).toBe("1,000 FCFA")
```

### Stores (Test with Mock)
```typescript
// Mock localStorage for testing
const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn()
}
```

### API Client (Test with MSW)
```typescript
// Mock Service Worker for API mocking
server.use(
  rest.get('/api/articles', (req, res, ctx) => {
    return res(ctx.json([]))
  })
)
```

---

## Summary

**Foundation provides:**
✅ Type-safe API client with auth  
✅ Optimized React Query for SSR  
✅ Persistent auth store  
✅ Reusable utilities  
✅ Mobile-first patterns  
✅ Testing infrastructure  

**Next steps:**
1. Implement shared layer
2. Create entity types from Prisma schema
3. Build first feature (article-create)
