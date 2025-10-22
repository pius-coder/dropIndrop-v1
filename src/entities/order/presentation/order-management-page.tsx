"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  MoreHorizontal,
  Eye,
  ShoppingCart,
  AlertCircle,
  Loader2,
  Calendar,
  User,
  Package,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@prisma/client";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: string;
    name: string;
    price: number;
  };
}

interface OrderCustomer {
  id: string;
  username: string;
  email?: string;
  phoneNumber: string;
}

interface OrderTicket {
  id: string;
  uniqueCode: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  totalAmount: number;
  paymentIntentId?: string;
  paidAt?: string;
  deliveredAt?: string;
  deliveredBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer: OrderCustomer;
  items: OrderItem[];
  ticket?: OrderTicket;
}

interface OrderStats {
  total: number;
  pending: number;
  paid: number;
  delivered: number;
  cancelled: number;
}

/**
 * Order Management Page Component
 * Admin interface for viewing and managing all orders with filtering capabilities
 */
export default function OrderManagementPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Selected order for status update
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (dateFrom) {
        params.append("dateFrom", dateFrom);
      }
      if (dateTo) {
        params.append("dateTo", dateTo);
      }
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`/api/admin/orders?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch orders when filters or page changes
  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, dateFrom, dateTo, searchTerm]);

  // Calculate stats
  const stats: OrderStats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "PENDING").length,
      paid: orders.filter((o) => o.status === "PAID").length,
      delivered: orders.filter((o) => o.status === "DELIVERED").length,
      cancelled: orders.filter((o) => o.status === "CANCELLED").length,
    };
  }, [orders]);

  // Filter orders based on search
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (!searchTerm) return true;

      const searchLower = searchTerm.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.customer.username.toLowerCase().includes(searchLower) ||
        order.customer.email?.toLowerCase().includes(searchLower) ||
        order.items.some((item) =>
          item.product.name.toLowerCase().includes(searchLower)
        )
      );
    });
  }, [orders, searchTerm]);

  // Paginate filtered orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFrom, dateTo]);

  // Update order status
  const updateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    notes?: string
  ) => {
    try {
      setIsUpdatingStatus(true);

      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      // Refresh orders
      await fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Failed to update order status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "secondary";
      case "PAID":
        return "default";
      case "DELIVERED":
        return "default";
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Get status icon
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "PAID":
        return <CreditCard className="h-4 w-4" />;
      case "DELIVERED":
        return <Truck className="h-4 w-4" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">
            View and manage all customer orders
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paid}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Filter and search through all orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as OrderStatus | "all")
              }
            >
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="From date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full lg:w-auto"
              />
              <Input
                type="date"
                placeholder="To date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full lg:w-auto"
              />
            </div>
          </div>

          {/* Orders Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Order</TableHead>
                  <TableHead className="min-w-[150px]">Customer</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Amount</TableHead>
                  <TableHead className="min-w-[150px]">Items</TableHead>
                  <TableHead className="min-w-[120px]">Date</TableHead>
                  <TableHead className="text-right min-w-[100px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center text-muted-foreground">
                        <ShoppingCart className="h-12 w-12 mb-4" />
                        <p>No orders found</p>
                        <p className="text-sm">
                          {searchTerm ||
                          statusFilter !== "all" ||
                          dateFrom ||
                          dateTo
                            ? "Try adjusting your search or filters"
                            : "No orders have been placed yet"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {order.orderNumber}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ID: {order.id.slice(0, 8)}...
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {order.customer.username}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.customer.phoneNumber}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(order.status)}
                          className="flex items-center space-x-1 w-fit"
                        >
                          {getStatusIcon(order.status)}
                          <span>{order.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {Number(order.totalAmount).toLocaleString()} XAF
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>{order.items.length} items</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {order.status === "PENDING" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateOrderStatus(order.id, "PAID")
                                  }
                                  disabled={isUpdatingStatus}
                                >
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Mark as Paid
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateOrderStatus(order.id, "CANCELLED")
                                  }
                                  disabled={isUpdatingStatus}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancel Order
                                </DropdownMenuItem>
                              </>
                            )}
                            {order.status === "PAID" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateOrderStatus(order.id, "DELIVERED")
                                }
                                disabled={isUpdatingStatus}
                              >
                                <Truck className="mr-2 h-4 w-4" />
                                Mark as Delivered
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, filteredOrders.length)} of{" "}
                {filteredOrders.length} orders
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      className={cn(
                        "cursor-pointer",
                        currentPage === 1 && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNumber =
                      Math.max(1, Math.min(totalPages - 4, currentPage - 2)) +
                      i;
                    if (pageNumber > totalPages) return null;

                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNumber)}
                          isActive={currentPage === pageNumber}
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      className={cn(
                        "cursor-pointer",
                        currentPage === totalPages &&
                          "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              View complete order information and update status
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Order Number:
                      </span>
                      <span className="font-medium">
                        {selectedOrder.orderNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge
                        variant={getStatusBadgeVariant(selectedOrder.status)}
                      >
                        {getStatusIcon(selectedOrder.status)}
                        <span className="ml-1">{selectedOrder.status}</span>
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Amount:
                      </span>
                      <span className="font-medium">
                        {Number(selectedOrder.totalAmount).toLocaleString()} XAF
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">
                        {selectedOrder.customer.username}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">
                        {selectedOrder.customer.phoneNumber}
                      </span>
                    </div>
                    {selectedOrder.customer.email && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">
                          {selectedOrder.customer.email}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} ×{" "}
                            {Number(item.unitPrice).toLocaleString()} XAF
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {Number(item.totalPrice).toLocaleString()} XAF
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Status Update Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Update Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.status === "PENDING" && (
                      <>
                        <Button
                          onClick={() =>
                            updateOrderStatus(selectedOrder.id, "PAID")
                          }
                          disabled={isUpdatingStatus}
                          className="flex items-center space-x-2"
                        >
                          <CreditCard className="h-4 w-4" />
                          <span>Mark as Paid</span>
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() =>
                            updateOrderStatus(selectedOrder.id, "CANCELLED")
                          }
                          disabled={isUpdatingStatus}
                          className="flex items-center space-x-2"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Cancel Order</span>
                        </Button>
                      </>
                    )}
                    {selectedOrder.status === "PAID" && (
                      <Button
                        onClick={() =>
                          updateOrderStatus(selectedOrder.id, "DELIVERED")
                        }
                        disabled={isUpdatingStatus}
                        className="flex items-center space-x-2"
                      >
                        <Truck className="h-4 w-4" />
                        <span>Mark as Delivered</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
