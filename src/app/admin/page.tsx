"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  Package,
  MessageSquare,
  Users,
  ShoppingCart,
  BarChart3,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity,
} from "lucide-react";
import { useAdminDashboard } from "@/lib/hooks/use-admin-dashboard";

export default function AdminDashboard() {
  const router = useRouter();
  const { data: dashboardData, isLoading, error } = useAdminDashboard();

  const stats = dashboardData?.stats || {
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalGroups: 0,
    recentOrders: 0,
    setupProgress: 0,
    activeProducts: 0,
    pendingOrders: 0,
    activeUsers: 0,
    activeGroups: 0,
  };

  const recentOrders = dashboardData?.recentOrders || [];
  const systemHealth = dashboardData?.systemHealth || {
    whatsappConnection: "disconnected" as const,
    paymentGateway: "inactive" as const,
    database: "unhealthy" as const,
    apiStatus: "error" as const,
  };

  const isSetupComplete = dashboardData?.isSetupComplete || false;

  console.log("Dashboard data:", dashboardData);

  const handleCompleteSetup = () => {
    router.push("/admin/configuration");
  };

  const handleViewConfiguration = () => {
    router.push("/admin/configuration");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.log("Error from dashboard" + JSON.stringify(error));

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Failed to load dashboard data
          </h3>
          <p className="text-muted-foreground">
            Please try refreshing the page or contact support if the problem
            persists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-col gap-1.5">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your DropInDrop administration panel
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isSetupComplete ? (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Setup Complete
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-amber-600 border-amber-200"
            >
              <AlertCircle className="w-3 h-3 mr-1" />
              Setup Required
            </Badge>
          )}
        </div>
      </div>

      {/* Setup Alert */}
      {!isSetupComplete && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Complete your platform setup</p>
                <p className="text-sm">
                  Configure WhatsApp integration, payment settings, and
                  notifications to get started.
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewConfiguration}
                >
                  View Configuration
                </Button>
                <Button size="sm" onClick={handleCompleteSetup}>
                  Complete Setup
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Setup Progress */}
      {!isSetupComplete && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Setup Progress</span>
            </CardTitle>
            <CardDescription>
              Complete these steps to get your platform ready
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Configuration Progress
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(stats.setupProgress)}%
                </span>
              </div>
              <Progress value={stats.setupProgress} className="w-full" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.setupProgress >= 25 ? "✓" : "○"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    General Settings
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.setupProgress >= 50 ? "✓" : "○"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    WhatsApp Config
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.setupProgress >= 75 ? "✓" : "○"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Payment Settings
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.setupProgress >= 100 ? "✓" : "○"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Notifications
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeProducts} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingOrders} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              WhatsApp Groups
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGroups}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeGroups} active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => router.push("/admin/products")}
            >
              <Package className="h-6 w-6" />
              <span>Add Product</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => router.push("/admin/whatsapp-groups")}
            >
              <MessageSquare className="h-6 w-6" />
              <span>Manage Groups</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => router.push("/admin/orders")}
            >
              <ShoppingCart className="h-6 w-6" />
              <span>View Orders</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => router.push("/admin/users")}
            >
              <Users className="h-6 w-6" />
              <span>Manage Users</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => router.push("/admin/analytics")}
            >
              <BarChart3 className="h-6 w-6" />
              <span>View Analytics</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => router.push("/admin/configuration")}
            >
              <Settings className="h-6 w-6" />
              <span>Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent orders</p>
                  <p className="text-sm">
                    Orders will appear here when customers make purchases
                  </p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.itemCount} items •{" "}
                        {order.totalAmount.toLocaleString()} XAF
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {order.customerName}
                      </p>
                    </div>
                    <Badge
                      variant={order.status === "PAID" ? "default" : "outline"}
                      className={
                        order.status === "PAID"
                          ? "bg-green-100 text-green-800"
                          : ""
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>
              Platform status and health metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">WhatsApp Connection</span>
                <Badge
                  className={
                    systemHealth.whatsappConnection === "connected"
                      ? "bg-green-100 text-green-800"
                      : systemHealth.whatsappConnection === "error"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {systemHealth.whatsappConnection === "connected"
                    ? "Connected"
                    : systemHealth.whatsappConnection === "error"
                    ? "Error"
                    : "Disconnected"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Payment Gateway</span>
                <Badge
                  className={
                    systemHealth.paymentGateway === "active"
                      ? "bg-green-100 text-green-800"
                      : systemHealth.paymentGateway === "error"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {systemHealth.paymentGateway === "active"
                    ? "Active"
                    : systemHealth.paymentGateway === "error"
                    ? "Error"
                    : "Inactive"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge
                  className={
                    systemHealth.database === "healthy"
                      ? "bg-green-100 text-green-800"
                      : systemHealth.database === "error"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {systemHealth.database === "healthy"
                    ? "Healthy"
                    : systemHealth.database === "error"
                    ? "Error"
                    : "Unhealthy"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">API Status</span>
                <Badge
                  className={
                    systemHealth.apiStatus === "operational"
                      ? "bg-green-100 text-green-800"
                      : systemHealth.apiStatus === "error"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {systemHealth.apiStatus === "operational"
                    ? "Operational"
                    : systemHealth.apiStatus === "error"
                    ? "Error"
                    : "Degraded"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
