import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { setupMiddleware } from "./src/lib/middleware/setup-middleware";

/**
 * Global middleware for DropInDrop platform
 * Handles setup detection and redirection logic
 */
export async function middleware(request: NextRequest) {
  // Apply setup middleware for admin routes
  return setupMiddleware(request);
}

/**
 * Configure which paths the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
