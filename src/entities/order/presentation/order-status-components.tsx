"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Truck,
  XCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { OrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface OrderStatusUpdateProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusUpdate: (
    orderId: string,
    newStatus: OrderStatus,
    notes?: string
  ) => Promise<void>;
  isUpdating?: boolean;
  trigger?: React.ReactNode;
  variant?: "default" | "compact";
}

interface OrderStatusBadgeProps {
  status: OrderStatus;
  showIcon?: boolean;
  className?: string;
}

/**
 * Order Status Badge Component
 * Displays order status with appropriate styling and icons
 */
export function OrderStatusBadge({
  status,
  showIcon = true,
  className,
}: OrderStatusBadgeProps) {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return {
          variant: "secondary" as const,
          icon: Clock,
          label: "Pending",
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      case "PAID":
        return {
          variant: "default" as const,
          icon: CreditCard,
          label: "Paid",
          className: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "DELIVERED":
        return {
          variant: "default" as const,
          icon: Truck,
          label: "Delivered",
          className: "bg-green-100 text-green-800 border-green-200",
        };
      case "CANCELLED":
        return {
          variant: "destructive" as const,
          icon: XCircle,
          label: "Cancelled",
          className: "bg-red-100 text-red-800 border-red-200",
        };
      default:
        return {
          variant: "outline" as const,
          icon: AlertCircle,
          label: status,
          className: "",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
}

/**
 * Order Status Update Component
 * Provides a comprehensive interface for updating order status with confirmation dialogs
 */
export function OrderStatusUpdate({
  orderId,
  currentStatus,
  onStatusUpdate,
  isUpdating = false,
  trigger,
  variant = "default",
}: OrderStatusUpdateProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [notes, setNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const availableTransitions = getAvailableStatusTransitions(currentStatus);

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;

    await onStatusUpdate(orderId, selectedStatus, notes || undefined);
    setSelectedStatus("");
    setNotes("");
    setIsDialogOpen(false);
  };

  const getStatusUpdateButton = (targetStatus: OrderStatus) => {
    const getButtonConfig = (status: OrderStatus) => {
      switch (status) {
        case "PAID":
          return {
            icon: CreditCard,
            label: "Mark as Paid",
            variant: "default" as const,
            className: "bg-blue-600 hover:bg-blue-700",
          };
        case "DELIVERED":
          return {
            icon: Truck,
            label: "Mark as Delivered",
            variant: "default" as const,
            className: "bg-green-600 hover:bg-green-700",
          };
        case "CANCELLED":
          return {
            icon: XCircle,
            label: "Cancel Order",
            variant: "destructive" as const,
            className: "",
          };
        default:
          return {
            icon: Clock,
            label: "Update Status",
            variant: "outline" as const,
            className: "",
          };
      }
    };

    const config = getButtonConfig(targetStatus);
    const Icon = config.icon;

    if (variant === "compact") {
      return (
        <Button
          size="sm"
          variant={config.variant}
          className={config.className}
          onClick={() =>
            onStatusUpdate(orderId, targetStatus, notes || undefined)
          }
          disabled={isUpdating}
        >
          {isUpdating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Icon className="h-3 w-3" />
          )}
        </Button>
      );
    }

    return (
      <Button
        variant={config.variant}
        className={config.className}
        onClick={() =>
          onStatusUpdate(orderId, targetStatus, notes || undefined)
        }
        disabled={isUpdating}
      >
        {isUpdating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <Icon className="h-4 w-4 mr-2" />
            {config.label}
          </>
        )}
      </Button>
    );
  };

  // For compact variant, show direct action buttons
  if (variant === "compact") {
    return (
      <div className="flex gap-1">
        {availableTransitions.map((status) => (
          <div key={status}>
            {status === "CANCELLED" ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to cancel this order? This action cannot be undone."
                    )
                  ) {
                    onStatusUpdate(orderId, status);
                  }
                }}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
              </Button>
            ) : (
              getStatusUpdateButton(status)
            )}
          </div>
        ))}
      </div>
    );
  }

  // For default variant, show dialog with status selection
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Update Status
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Change the status of this order. Some status changes may trigger
            notifications to the customer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Current Status
            </label>
            <OrderStatusBadge status={currentStatus} />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">New Status</label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {availableTransitions.map((status) => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status)}
                      <span>{getStatusLabel(status)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Notes (Optional)
            </label>
            <Textarea
              placeholder="Add notes about this status change..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStatusUpdate}
            disabled={!selectedStatus || isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Bulk Order Status Update Component
 * Allows updating multiple orders at once
 */
interface BulkStatusUpdateProps {
  orderIds: string[];
  currentStatus: OrderStatus;
  onBulkUpdate: (
    orderIds: string[],
    newStatus: OrderStatus,
    notes?: string
  ) => Promise<void>;
  isUpdating?: boolean;
  trigger?: React.ReactNode;
}

export function BulkStatusUpdate({
  orderIds,
  currentStatus,
  onBulkUpdate,
  isUpdating = false,
  trigger,
}: BulkStatusUpdateProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [notes, setNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const availableTransitions = getAvailableStatusTransitions(currentStatus);

  const handleBulkUpdate = async () => {
    if (!selectedStatus || orderIds.length === 0) return;

    await onBulkUpdate(orderIds, selectedStatus, notes || undefined);
    setSelectedStatus("");
    setNotes("");
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Bulk Update ({orderIds.length})
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Status Update</DialogTitle>
          <DialogDescription>
            Update the status of {orderIds.length} selected orders.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Current Status
            </label>
            <OrderStatusBadge status={currentStatus} />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">New Status</label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {availableTransitions.map((status) => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status)}
                      <span>{getStatusLabel(status)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Notes (Optional)
            </label>
            <Textarea
              placeholder="Add notes about this bulk status change..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkUpdate}
            disabled={!selectedStatus || isUpdating || orderIds.length === 0}
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              `Update ${orderIds.length} Orders`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions
function getAvailableStatusTransitions(
  currentStatus: OrderStatus
): OrderStatus[] {
  switch (currentStatus) {
    case "PENDING":
      return ["PAID", "CANCELLED"];
    case "PAID":
      return ["DELIVERED"];
    case "DELIVERED":
    case "CANCELLED":
      return []; // Terminal states
    default:
      return [];
  }
}

function getStatusIcon(status: OrderStatus) {
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
}

function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "PAID":
      return "Paid";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}
