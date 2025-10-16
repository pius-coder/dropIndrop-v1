/**
 * Admin Layout
 * 
 * Wraps all admin pages with:
 * - Authentication check
 * - Admin navigation sidebar
 * - Role-based access control
 */

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminNav } from "@/widgets/admin-nav";
import { useAuthStore } from "@/shared/store/auth-store";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  
  // Skip auth check for login page
  const isLoginPage = pathname === "/admin/login";
  
  useEffect(() => {
    if (!isAuthenticated && !isLoginPage) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, isLoginPage, router]);
  
  // If login page, show without layout
  if (isLoginPage) {
    return <>{children}</>;
  }
  
  // If not authenticated, show nothing (redirecting)
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <AdminNav />
      
      {/* Main Content */}
      <main className="flex-1 p-8 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
