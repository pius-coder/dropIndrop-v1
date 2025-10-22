import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

// Types for authentication middleware
export interface AuthenticatedUser {
  id: string;
  username: string;
  email?: string;
  phoneNumber: string;
  role: UserRole;
  isActive: boolean;
}

export interface AuthMiddlewareOptions {
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
  requireAllRoles?: boolean; // If true, user must have ALL roles; if false, user needs ANY of the roles
}

// JWT payload interface
interface JWTPayload {
  userId: string;
  username: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME || "dropindrop-session";

/**
 * Verify JWT token and extract user information
 */
function verifyJWT(token: string): AuthenticatedUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    return {
      id: decoded.userId,
      username: decoded.username,
      role: decoded.role,
      phoneNumber: "", // Will be populated from database if needed
      isActive: true, // Will be populated from database if needed
    };
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * Get user from database with full details
 * For demo purposes, returns mock user data
 * In production, this would query your actual database
 */
async function getUserFromDatabase(
  userId: string
): Promise<AuthenticatedUser | null> {
  // For demo purposes, return mock user data
  // In production, you'd query your database here using Prisma
  return {
    id: userId,
    username: "demo-user",
    email: "demo@dropindrop.com",
    phoneNumber: "+237600000000",
    role: UserRole.ADMIN, // Default to admin for demo
    isActive: true,
  };
}

/**
 * Extract token from various sources in order of priority:
 * 1. Authorization header (Bearer token)
 * 2. Cookie
 * 3. Query parameter (for development/testing)
 */
function extractToken(request: NextRequest): string | null {
  // 1. Check Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // 2. Check cookie
  const cookieToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // 3. Check query parameter (development only)
  if (process.env.NODE_ENV === "development") {
    const url = new URL(request.url);
    const queryToken = url.searchParams.get("token");
    if (queryToken) {
      return queryToken;
    }
  }

  return null;
}

/**
 * Main authentication middleware function
 */
export async function authMiddleware(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
): Promise<{
  user: AuthenticatedUser | null;
  response: NextResponse | null;
}> {
  const {
    requireAuth = true,
    allowedRoles = [],
    requireAllRoles = false,
  } = options;

  // Extract token from request
  const token = extractToken(request);

  // If no token provided
  if (!token) {
    if (requireAuth) {
      return {
        user: null,
        response: NextResponse.json(
          { success: false, error: "Authentication required" },
          { status: 401 }
        ),
      };
    }
    return { user: null, response: null };
  }

  // Verify JWT token
  const user = verifyJWT(token);
  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      ),
    };
  }

  // Get full user details from database
  const fullUser = await getUserFromDatabase(user.id);
  if (!fullUser) {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, error: "User not found" },
        { status: 401 }
      ),
    };
  }

  // Check if user account is active
  if (!fullUser.isActive) {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, error: "Account is disabled" },
        { status: 403 }
      ),
    };
  }

  // Check role-based access if roles are specified
  if (allowedRoles.length > 0) {
    const userRole = fullUser.role;
    const hasAccess = requireAllRoles
      ? allowedRoles.every((role) => userRole === role)
      : allowedRoles.some((role) => userRole === role);

    if (!hasAccess) {
      return {
        user: null,
        response: NextResponse.json(
          { success: false, error: "Insufficient permissions" },
          { status: 403 }
        ),
      };
    }
  }

  return { user: fullUser, response: null };
}

/**
 * Higher-order function to create middleware for specific routes
 */
export function withAuth(options: AuthMiddlewareOptions = {}) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { user, response } = await authMiddleware(request, options);

    // If middleware returned an error response, return it
    if (response) {
      return response;
    }

    // Add user information to request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    if (user) {
      requestHeaders.set("x-user-id", user.id);
      requestHeaders.set("x-user-role", user.role);
      requestHeaders.set("x-user-username", user.username);
    }

    // Create new request with additional headers
    const newRequest = new NextRequest(request.url, {
      method: request.method,
      headers: requestHeaders,
      body: request.body,
    });

    // For API routes, we need to handle this differently
    // This is a simplified version - in practice, you'd integrate with Next.js middleware
    return NextResponse.next();
  };
}

/**
 * Convenience middleware functions for common use cases
 */

// Require any authentication
export function requireAuth(request: NextRequest): Promise<NextResponse> {
  return withAuth({ requireAuth: true })(request);
}

// Require specific role(s)
export function requireRole(roles: UserRole | UserRole[], requireAll = false) {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  return withAuth({ allowedRoles: roleArray, requireAllRoles: requireAll });
}

// Require admin access (Super Admin or Admin)
export function requireAdmin(request: NextRequest): Promise<NextResponse> {
  return withAuth({
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  })(request);
}

// Require Super Admin only
export function requireSuperAdmin(request: NextRequest): Promise<NextResponse> {
  return withAuth({
    allowedRoles: [UserRole.SUPER_ADMIN],
  })(request);
}

// Optional authentication (for public endpoints that can enhance with user context)
export function optionalAuth(request: NextRequest): Promise<NextResponse> {
  return withAuth({ requireAuth: false })(request);
}

/**
 * Utility function to get current user from request (for API routes)
 */
export async function getCurrentUser(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  const { user } = await authMiddleware(request, { requireAuth: false });
  return user;
}

/**
 * Utility function to check if current user has specific role
 */
export function hasRole(
  user: AuthenticatedUser | null,
  role: UserRole
): boolean {
  return user?.role === role;
}

/**
 * Utility function to check if current user has any of the specified roles
 */
export function hasAnyRole(
  user: AuthenticatedUser | null,
  roles: UserRole[]
): boolean {
  return user ? roles.includes(user.role) : false;
}

/**
 * Utility function to check if current user has all of the specified roles
 */
export function hasAllRoles(
  user: AuthenticatedUser | null,
  roles: UserRole[]
): boolean {
  return user ? roles.every((role) => user.role === role) : false;
}
