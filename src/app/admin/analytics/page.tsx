"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Package,
  Activity,
  Calendar,
} from "lucide-react";

interface AnalyticsData {
  period: string;
  userAnalytics: {
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
  } | null;
  productAnalytics: {
    topViewedProducts: Array<{
      id: string;
      name: string;
      viewCount: number;
      categoryName: string;
    }>;
  };
  revenueAnalytics: {
    totalRevenue: number;
    averageOrderValue: number;
    totalOrders: number;
    deliveredOrders: number;
  };
  growthMetrics: {
    newUsers: number;
    newOrders: number;
  };
  orderStatusDistribution: Array<{
    status: string;
    count: number;
  }>;
  topCustomers: Array<{
    userId: string;
    username: string;
    email?: string;
    totalSpent: number;
  }>;
  dateRange: {
    start: string;
    end: string;
  };
}

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("30d");

  const fetchAnalytics = async (selectedPeriod: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/admin/analytics?period=${selectedPeriod}`
      );
      if (!response.ok) throw new Error("Failed to fetch analytics");

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "XAF",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No analytics data available
          </h3>
          <p className="text-muted-foreground">
            Analytics data will appear here once users start interacting with
            the platform.
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
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Insights into user behavior, product performance, and business
            metrics
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Badge variant="outline" className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>
              {formatDate(data.dateRange.start)} -{" "}
              {formatDate(data.dateRange.end)}
            </span>
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.userAnalytics?.totalUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />+
              {data.growthMetrics.newUsers} new users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.revenueAnalytics.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              {data.revenueAnalytics.deliveredOrders} delivered orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Order Value
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.revenueAnalytics.averageOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Across {data.revenueAnalytics.totalOrders} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.userAnalytics?.conversionRate.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Active vs total users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products by Views */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Top Products by Views</span>
            </CardTitle>
            <CardDescription>
              Most viewed products in the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.productAnalytics.topViewedProducts
                .slice(0, 5)
                .map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.categoryName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{product.viewCount}</p>
                      <p className="text-sm text-muted-foreground">views</p>
                    </div>
                  </div>
                ))}

              {data.productAnalytics.topViewedProducts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No product view data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Order Status Distribution</span>
            </CardTitle>
            <CardDescription>Breakdown of orders by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.orderStatusDistribution.map((status) => (
                <div
                  key={status.status}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        status.status === "DELIVERED"
                          ? "default"
                          : status.status === "PAID"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {status.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{status.count}</p>
                    <p className="text-sm text-muted-foreground">
                      {data.revenueAnalytics.totalOrders > 0
                        ? (
                            (status.count / data.revenueAnalytics.totalOrders) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              ))}

              {data.orderStatusDistribution.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No order data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Top Customers</span>
          </CardTitle>
          <CardDescription>
            Customers with highest spending in the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topCustomers.slice(0, 10).map((customer, index) => (
              <div
                key={customer.userId}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{customer.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.email || "No email"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(customer.totalSpent)}
                  </p>
                  <p className="text-sm text-muted-foreground">spent</p>
                </div>
              </div>
            ))}

            {data.topCustomers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No customer spending data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Analytics Summary */}
      {data.userAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Active Users
                  </span>
                  <span className="font-medium">
                    {data.userAnalytics.activeUsers} /{" "}
                    {data.userAnalytics.totalUsers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Conversion Rate
                  </span>
                  <span className="font-medium">
                    {data.userAnalytics.conversionRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Revenue Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Revenue
                  </span>
                  <span className="font-medium">
                    {formatCurrency(data.userAnalytics.totalRevenue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Avg Order Value
                  </span>
                  <span className="font-medium">
                    {formatCurrency(data.userAnalytics.averageOrderValue)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    New Users
                  </span>
                  <span className="font-medium text-green-600">
                    +{data.growthMetrics.newUsers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    New Orders
                  </span>
                  <span className="font-medium text-blue-600">
                    +{data.growthMetrics.newOrders}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
