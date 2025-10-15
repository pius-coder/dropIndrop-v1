# Context7 Research: React Query List Patterns

## Query: List queries, pagination, infinite scroll, filtering

Research for implementing article list with React Query best practices.

## Key Findings

### 1. Basic List Query
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['articles'],
  queryFn: fetchArticles
});
```

### 2. Query with Filters
```typescript
const { data } = useQuery({
  queryKey: ['articles', { category, search }],
  queryFn: () => fetchArticles({ category, search })
});
```

### 3. Pagination
```typescript
const [page, setPage] = useState(1);

const { data } = useQuery({
  queryKey: ['articles', page],
  queryFn: () => fetchArticles({ page, limit: 20 })
});
```

### 4. Infinite Scroll
```typescript
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useInfiniteQuery({
  queryKey: ['articles'],
  queryFn: ({ pageParam = 0 }) => fetchArticles({ offset: pageParam }),
  getNextPageParam: (lastPage) => lastPage.nextOffset
});
```

### 5. Prefetching
```typescript
const queryClient = useQueryClient();

// Prefetch next page
queryClient.prefetchQuery({
  queryKey: ['articles', page + 1],
  queryFn: () => fetchArticles({ page: page + 1 })
});
```

## Implementation Strategy

**For Article List:**
- Use basic query with filters for simplicity
- Add category & search filters
- Implement pagination (mobile-friendly)
- Add prefetching for smooth UX
- Cache results for 60s (staleTime)

## Notes
- Keep queryKey consistent with filters
- Use optimistic updates for better UX
- Mobile-first: Grid layout with touch-friendly cards
- French translations throughout
