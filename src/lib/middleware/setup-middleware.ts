import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "./auth-middleware";
import { UserRole } from "@prisma/client";

/**
 * Middleware to check if platform setup is complete
 * Redirects to configuration wizard if setup is incomplete
 */
export async function setupMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and auth pages
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Check if this is an admin route
  if (pathname.startsWith("/admin")) {
    // Check authentication first
    const authResult = await authMiddleware(request, {
      allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    });

    // If auth failed, return the auth error response
    if (authResult.response) {
      return authResult.response;
    }

    // User is authenticated and has admin role
    const user = authResult.user;

    // Check if setup is complete
    try {
      const configResponse = await fetch(
        `${request.nextUrl.origin}/api/admin/configuration`,
        {
          headers: {
            cookie: request.headers.get("cookie") || "",
          },
        }
      );

      if (configResponse.ok) {
        const configData = await configResponse.json();

        // If setup is not complete and user is not on configuration page, redirect
        if (
          !configData.data?.isComplete &&
          !pathname.endsWith("/configuration")
        ) {
          console.log(
            "Setup middleware: Setup not complete, redirecting to configuration"
          );
          const redirectUrl = new URL("/admin/configuration", request.url);
          return NextResponse.redirect(redirectUrl);
        }
      } else if (configResponse.status === 404) {
        // No configuration exists yet, redirect to setup
        if (!pathname.endsWith("/configuration")) {
          const redirectUrl = new URL("/admin/configuration", request.url);
          return NextResponse.redirect(redirectUrl);
        }
      }
    } catch (error) {
      console.error("Error checking setup status:", error);
      // On error, redirect to configuration to be safe
      if (!pathname.endsWith("/configuration")) {
        const redirectUrl = new URL("/admin/configuration", request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return NextResponse.next();
}

/**
 * Higher-order function to create setup-aware middleware
 */
export function withSetupCheck(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const setupResult = await setupMiddleware(request);

    // If setup middleware returned a redirect, return it
    if (setupResult.status === 302 || setupResult.status === 301) {
      return setupResult;
    }

    // Otherwise, call the original handler
    return handler(request);
  };
}
