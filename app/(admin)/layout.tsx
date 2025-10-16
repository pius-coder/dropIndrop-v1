/**
 * Admin Layout
 * 
 * Wraps all admin pages with:
 * - Authentication check
 * - Admin navigation sidebar
 * - Role-based access control
 */

import { redirect } from "next/navigation";
import { AdminNav } from "@/widgets/admin-nav";

export default function AdminLayout({
  children,
}: {
  children: React.Node;
}) {
  // TODO: Check if user is authenticated admin
  // For now, this is a placeholder - will implement with auth
  
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
