/**
 * Admin Navigation Sidebar
 *
 * Shows navigation menu based on admin role
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Send,
  ShoppingCart,
  FolderTree,
  Users,
  UserCog,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/shared/store/auth-store";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Articles", href: "/admin/articles", icon: Package },
  { name: "Drops", href: "/admin/drops", icon: Send },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Catégories", href: "/admin/categories", icon: FolderTree },
  { name: "Groupes WA", href: "/admin/whatsapp-groups", icon: Users },

  // Super Admin Only (TODO: filter based on role)
  { name: "Équipe", href: "/admin/team", icon: UserCog, superAdminOnly: true },
  {
    name: "Paramètres",
    href: "/admin/settings",
    icon: Settings,
    superAdminOnly: true,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">Drop-In-Drop</h1>
        <p className="text-sm text-gray-400">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-800">
        <div className="mb-3">
          <p className="text-sm font-medium">{user?.name || "Admin User"}</p>
          <p className="text-xs text-gray-400">{user?.email || "admin@example.com"}</p>
          <p className="text-xs text-gray-500 mt-1">
            {user?.role || "ADMIN"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
}
