# Context7 Research: React Query Mutations

## Query: mutations, useMutation, optimistic updates, invalidate queries

Research for implementing article create with React Query mutations.

## Key Patterns

### 1. Basic Mutation
```typescript
const mutation = useMutation({
  mutationFn: createArticle,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['articles'] })
  }
});
```

### 2. With Optimistic Updates
```typescript
const mutation = useMutation({
  mutationFn: updateArticle,
  onMutate: async (newData) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: ['articles'] });
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['articles']);
    
    // Optimistically update
    queryClient.setQueryData(['articles'], (old) => [...old, newData]);
    
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['articles'], context.previous);
  },
  onSettled: () => {
    // Refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['articles'] });
  }
});
```

### 3. Toast Notifications
```typescript
const mutation = useMutation({
  mutationFn: createArticle,
  onSuccess: () => {
    toast.success("Article créé avec succès");
    router.push('/articles');
  },
  onError: (error) => {
    toast.error("Erreur: " + error.message);
  }
});
```

## Implementation Strategy

**For Article Create:**
- Use useMutation for create operation
- Invalidate 'articles' queries on success
- Show toast notifications
- Redirect to list after success
- Handle validation errors from API
- Loading state during mutation

## Best Practices
- Always invalidate related queries
- Handle loading/error states
- Provide user feedback (toasts)
- Reset form on success
- Handle network errors gracefully
