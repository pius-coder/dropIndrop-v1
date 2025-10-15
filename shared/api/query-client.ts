/**
 * React Query Client Configuration
 * 
 * Optimized for Next.js SSR:
 * - Server: New client per request
 * - Browser: Singleton instance
 * - 60s staleTime to prevent immediate refetch after hydration
 */

"use client";

import {
  QueryClient,
  isServer,
  defaultShouldDehydrateQuery,
} from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we want to set staleTime > 0 to avoid refetching immediately on client
        staleTime: 60 * 1000, // 60 seconds
        retry: 1,
        refetchOnWindowFocus: false,
      },
      dehydrate: {
        // Include pending queries for streaming
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is critical - we don't re-make if React suspends during initial render
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
