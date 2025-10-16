/**
 * Next.js Middleware
 *
 * Route protection for:
 * - Admin routes (/admin/*)
 * - Client routes (/client/*)
 * - Protected routes
 * - Public routes
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Route patterns
const ADMIN_ROUTES = /^\/admin(?!\/login)/; // All /admin/* except /admin/login
const CLIENT_ROUTES = /^\/client/; // All /client/*
const PUBLIC_ROUTES = [
  "/",
  "/a/", // Public article pages
  "/ticket/", // Public ticket view
  "/api/", // API routes (have their own auth)
];

/**
 * Check if route is public
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Get JWT token from HTTP-only cookie
 */
function getAuthToken(request: NextRequest): string | null {
  return request.cookies.get("auth-token")?.value || null;
}

/**
 * Verify and decode JWT token using hono/jwt
 */
async function verifyToken(token: string): Promise<any | null> {
  try {
    const { verify } = await import("hono/jwt");
    const secret = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
    const decoded = await verify(token, secret);
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Check if user is admin
 */
function isAdmin(auth: any): boolean {
  return (
    auth?.user?.role &&
    ["SUPER_ADMIN", "ADMIN", "DELIVERY_MANAGER", "SUPPORT"].includes(
      auth.user.role
    )
  );
}

/**
 * Check if user is customer
 */
function isCustomer(auth: any): boolean {
  return auth?.user && !auth.user.role; // Customers don't have roles
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, images, and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get JWT token from cookie
  const token = getAuthToken(request);

  // For admin routes, verify JWT token
  let userData: any = null;
  if (token && (ADMIN_ROUTES.test(pathname) || CLIENT_ROUTES.test(pathname))) {
    userData = await verifyToken(token);
  }

  const isAuthenticated = !!userData;

  // ============================================
  // ADMIN ROUTES
  // ============================================
  if (ADMIN_ROUTES.test(pathname)) {
    // Check if authenticated and is admin
    if (!isAuthenticated || !isAdmin({ user: userData })) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin authenticated, allow access
    return NextResponse.next();
  }

  // ============================================
  // ADMIN LOGIN PAGE
  // ============================================
  if (pathname === "/admin/login") {
    // If already authenticated as admin, redirect to dashboard
    if (isAuthenticated && isAdmin({ user: userData })) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    // Not authenticated, show login page
    return NextResponse.next();
  }

  // ============================================
  // CLIENT ROUTES (Protected customer area)
  // ============================================
  if (CLIENT_ROUTES.test(pathname)) {
    // If not authenticated as customer
    if (!isAuthenticated || !isCustomer({ user: userData })) {
      const loginUrl = new URL("/", request.url); // Redirect to home with OTP
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Customer is authenticated, allow access
    return NextResponse.next();
  }

  // ============================================
  // PUBLIC ROUTES
  // ============================================
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // ============================================
  // ROOT REDIRECT
  // ============================================
  if (pathname === "/admin") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Default: allow access
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)",
  ],
};
