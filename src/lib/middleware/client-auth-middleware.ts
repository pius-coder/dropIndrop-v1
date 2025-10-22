import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { UserRole, PrismaClient } from "@prisma/client";

// Initialize Prisma client for user data lookup
const prisma = new PrismaClient();

// Types for client authentication middleware
export interface ClientAuthUser {
  id: string;
  username: string;
  email?: string;
  phoneNumber: string;
  role: UserRole;
  isActive: boolean;
}

export interface ClientAuthMiddlewareOptions {
  requireAuth?: boolean;
  requireClientRole?: boolean;
}

/**
 * Verify JWT token and extract client user information from database
 */
async function verifyClientJWT(token: string): Promise<ClientAuthUser | null> {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Ensure user has CLIENT role
    if (decoded.role !== UserRole.CLIENT) {
      return null;
    }

    // Fetch complete user data from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        phoneNumber: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      console.error("User not found in database:", decoded.userId);
      return null;
    }

    // Ensure user still has CLIENT role and is active
    if (user.role !== UserRole.CLIENT || !user.isActive) {
      console.error("User role or status invalid:", user.id);
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email || undefined,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isActive: user.isActive,
    };
  } catch (error) {
    console.error("Client JWT verification failed:", error);
    return null;
  }
}

/**
 * Extract token from request (cookie or authorization header)
 */
function extractClientToken(request: NextRequest): string | null {
  // 1. Check cookie first
  const SESSION_COOKIE_NAME =
    process.env.SESSION_COOKIE_NAME || "dropindrop-session";
  const cookieToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // 2. Check Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Main client authentication middleware function
 */
export async function clientAuthMiddleware(
  request: NextRequest,
  options: ClientAuthMiddlewareOptions = {}
): Promise<{
  user: ClientAuthUser | null;
  response: NextResponse | null;
}> {
  const { requireAuth = true, requireClientRole = true } = options;

  // Extract token from request
  const token = extractClientToken(request);

  // If no token provided
  if (!token) {
    if (requireAuth) {
      return {
        user: null,
        response: NextResponse.json(
          {
            success: false,
            error: "Authentication required",
            redirectTo: "/auth/client",
          },
          { status: 401 }
        ),
      };
    }
    return { user: null, response: null };
  }

  // Verify JWT token and get user data from database
  const user = await verifyClientJWT(token);
  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          error: "Invalid or expired token",
          redirectTo: "/auth/client",
        },
        { status: 401 }
      ),
    };
  }

  // Check if user has CLIENT role
  if (requireClientRole && user.role !== UserRole.CLIENT) {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          error: "Client access required",
          redirectTo: "/auth/client",
        },
        { status: 403 }
      ),
    };
  }

  // Check if user account is active
  if (!user.isActive) {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          error: "Account is disabled",
          redirectTo: "/auth/client",
        },
        { status: 403 }
      ),
    };
  }

  return { user, response: null };
}

/**
 * Higher-order function to create client auth middleware for specific routes
 */
export function withClientAuth(options: ClientAuthMiddlewareOptions = {}) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { user, response } = await clientAuthMiddleware(request, options);

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
      requestHeaders.set("x-user-phone", user.phoneNumber);
    }

    // Create new request with additional headers
    const newRequest = new NextRequest(request.url, {
      method: request.method,
      headers: requestHeaders,
      body: request.body,
    });

    return NextResponse.next();
  };
}

/**
 * Convenience middleware functions for common use cases
 */

// Require client authentication
export function requireClientAuth(request: NextRequest): Promise<NextResponse> {
  return withClientAuth({ requireAuth: true, requireClientRole: true })(
    request
  );
}

// Optional client authentication (for public endpoints that can enhance with client context)
export function optionalClientAuth(
  request: NextRequest
): Promise<NextResponse> {
  return withClientAuth({ requireAuth: false, requireClientRole: true })(
    request
  );
}

/**
 * Utility function to get current client user from request (for API routes)
 */
export async function getCurrentClientUser(
  request: NextRequest
): Promise<ClientAuthUser | null> {
  const { user } = await clientAuthMiddleware(request, {
    requireAuth: false,
    requireClientRole: true,
  });
  return user;
}

/**
 * Utility function to check if current user is a client
 */
export function isClient(user: ClientAuthUser | null): boolean {
  return user?.role === UserRole.CLIENT;
}

/**
 * Utility function to check if current user is authenticated as a client
 */
export async function isAuthenticatedAsClient(
  request: NextRequest
): Promise<boolean> {
  const user = await getCurrentClientUser(request);
  return isClient(user);
}

/**
 * Create a redirect response to client authentication page
 */
export function redirectToClientAuth(): NextResponse {
  return NextResponse.redirect(
    new URL("/auth/client", process.env.NEXTAUTH_URL || "http://localhost:3000")
  );
}
