"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Settings,
  Package,
  MessageSquare,
  Users,
  ShoppingCart,
  Truck,
  BarChart3,
  Menu,
  Bell,
  User,
  LogOut,
  ChevronDown,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Navigation items
const NAVIGATION_ITEMS = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Overview and analytics",
  },
  {
    title: "Configuration",
    href: "/admin/configuration",
    icon: Settings,
    description: "Platform settings",
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
    description: "Manage product catalog",
  },
  {
    title: "Drops",
    href: "/admin/drops",
    icon: Package,
    description: "Manage product drops",
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: Package,
    description: "Manage product categories",
  },
  {
    title: "WhatsApp Groups",
    href: "/admin/whatsapp-groups",
    icon: MessageSquare,
    description: "Manage WhatsApp groups",
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    description: "User management",
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    description: "Order management",
  },
  {
    title: "Deliveries",
    href: "/admin/deliveries",
    icon: Truck,
    description: "Delivery tracking",
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    description: "Reports and insights",
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  // Check setup status and user authentication
  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        // Check if user is authenticated
        const authResponse = await fetch("/api/auth/me");
        if (!authResponse.ok) {
          router.push("/login");
          return;
        }

        const authData = await authResponse.json();

        // If no user data, redirect to login
        if (!authData.user) {
          router.push("/login");
          return;
        }

        setUser({
          name: authData.user.username || "Admin User",
          role: authData.user.role || "ADMIN",
        });

        // Check setup status
        const configResponse = await fetch("/api/admin/configuration");
        if (configResponse.ok) {
          const configData = await configResponse.json();
          setIsSetupComplete(configData.data?.isComplete || false);
        }
      } catch (error) {
        console.error("Error checking setup status:", error);
        // Don't redirect on error, let middleware handle it
      } finally {
        setIsLoading(false);
      }
    };

    checkSetupStatus();
  }, [router]);

  // Redirect to setup if not complete
  useEffect(() => {
    if (!isLoading && !isSetupComplete && pathname !== "/admin/configuration") {
      console.log("Setup not complete, redirecting to configuration");
      router.push("/admin/configuration");
    }
  }, [isLoading, isSetupComplete, pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container justify-between mx-auto gap-5 flex h-16 items-center">
          {/* Mobile menu trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <AdminSidebar />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <MessageSquare className="h-4 w-4" />
              </div>
              <span className="font-bold">DropInDrop Admin</span>
            </Link>
          </div>

          {/* Setup status indicator */}
          {!isSetupComplete && (
            <div className="ml-4 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <Badge
                variant="outline"
                className="text-amber-600 border-amber-200"
              >
                Setup Required
              </Badge>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* User menu */}
          <div className=" flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.role}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex fixed w-64 flex-col border-r bg-muted/10 h-[calc(100vh-64px)]">
          <AdminSidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 md:ml-64">{children}</main>
      </div>
    </div>
  );
}

function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="p-6">
        <h2 className="text-lg font-semibold">Administration</h2>
        <p className="text-sm text-muted-foreground">
          Manage your DropInDrop platform
        </p>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <div className="flex-1">
                <div>{item.title}</div>
                <div className="text-xs opacity-75">{item.description}</div>
              </div>
            </Link>
          );
        })}
      </nav>

      <Separator />

      <div className="p-4">
        <div className="rounded-lg bg-muted p-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">System Status</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            All systems operational
          </p>
        </div>
      </div>
    </div>
  );
}
