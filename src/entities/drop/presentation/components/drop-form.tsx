"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, Loader2, X } from "lucide-react";
import { useDropManagement } from "@/lib/hooks/use-drop-management";

interface DropFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  editingDrop?: any;
}

export default function DropForm({
  onSuccess,
  onCancel,
  editingDrop,
}: DropFormProps) {
  const {
    availableProducts,
    availableGroups,
    createDrop,
    updateDrop,
    isCreating,
    isUpdating,
  } = useDropManagement();

  const [formData, setFormData] = useState({
    name: editingDrop?.name || "",
    scheduledDate: editingDrop?.scheduledDate
      ? new Date(editingDrop.scheduledDate).toISOString().split("T")[0]
      : "",
    scheduledTime: editingDrop?.scheduledDate
      ? new Date(editingDrop.scheduledDate).toTimeString().slice(0, 5)
      : "09:00",
    selectedProductIds:
      editingDrop?.products?.map((p: any) => p.productId) || [],
    selectedGroupIds: editingDrop?.groups?.map((g: any) => g.groupId) || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isLoading = isCreating || isUpdating;
  const isEditing = !!editingDrop;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      validationErrors.name = "Drop name is required";
    }

    if (!formData.scheduledDate) {
      validationErrors.scheduledDate = "Scheduled date is required";
    }

    if (!formData.scheduledTime) {
      validationErrors.scheduledTime = "Scheduled time is required";
    }

    if (formData.selectedProductIds.length === 0) {
      validationErrors.products = "At least one product must be selected";
    }

    if (formData.selectedGroupIds.length === 0) {
      validationErrors.groups = "At least one WhatsApp group must be selected";
    }

    // Check if scheduled date/time is in the future
    if (formData.scheduledDate && formData.scheduledTime) {
      const scheduledDateTime = new Date(
        `${formData.scheduledDate}T${formData.scheduledTime}`
      );
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      if (scheduledDateTime < oneHourFromNow) {
        validationErrors.scheduledDateTime =
          "Drop must be scheduled at least 1 hour in the future";
      }
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      // Combine date and time
      const scheduledDateTime = new Date(
        `${formData.scheduledDate}T${formData.scheduledTime}`
      );

      const dropData = {
        name: formData.name.trim(),
        scheduledDate: scheduledDateTime.toISOString(),
        productIds: formData.selectedProductIds,
        groupIds: formData.selectedGroupIds,
      };

      if (editingDrop) {
        await updateDrop({ id: editingDrop.id, data: dropData });
      } else {
        await createDrop(dropData);
      }

      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to save drop:", error);
      setErrors({ submit: error.message || "Failed to save drop" });
    }
  };

  // Handle product selection
  const handleProductToggle = (productId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      selectedProductIds: checked
        ? [...prev.selectedProductIds, productId]
        : prev.selectedProductIds.filter((id) => id !== productId),
    }));
    if (errors.products) {
      setErrors((prev) => ({ ...prev, products: "" }));
    }
  };

  // Handle group selection
  const handleGroupToggle = (groupId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      selectedGroupIds: checked
        ? [...prev.selectedGroupIds, groupId]
        : prev.selectedGroupIds.filter((id) => id !== groupId),
    }));
    if (errors.groups) {
      setErrors((prev) => ({ ...prev, groups: "" }));
    }
  };

  // Get product details
  const getProduct = (id: string) => availableProducts.find((p) => p.id === id);
  const getGroup = (id: string) => availableGroups.find((g) => g.id === id);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {errors.submit && (
        <Alert variant="destructive">
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Drop Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Summer Collection Drop"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    scheduledDate: e.target.value,
                  }))
                }
                min={new Date().toISOString().split("T")[0]}
                className={errors.scheduledDate ? "border-destructive" : ""}
              />
              {errors.scheduledDate && (
                <p className="text-sm text-destructive mt-1">
                  {errors.scheduledDate}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="scheduledTime">Scheduled Time</Label>
              <Input
                id="scheduledTime"
                type="time"
                value={formData.scheduledTime}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    scheduledTime: e.target.value,
                  }))
                }
                className={errors.scheduledTime ? "border-destructive" : ""}
              />
              {errors.scheduledTime && (
                <p className="text-sm text-destructive mt-1">
                  {errors.scheduledTime}
                </p>
              )}
            </div>
          </div>

          {errors.scheduledDateTime && (
            <p className="text-sm text-destructive">
              {errors.scheduledDateTime}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Product Selection */}
      <Card>
        <CardHeader>
          <CardTitle>
            Products ({formData.selectedProductIds.length} selected)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {errors.products && (
            <p className="text-sm text-destructive mb-4">{errors.products}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
            {availableProducts.map((product) => {
              const isSelected = formData.selectedProductIds.includes(
                product.id
              );
              return (
                <div
                  key={product.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg"
                >
                  <Checkbox
                    id={`product-${product.id}`}
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handleProductToggle(product.id, checked as boolean)
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor={`product-${product.id}`}
                      className="font-medium cursor-pointer"
                    >
                      {product.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {product.price.toLocaleString()} XAF
                      {product.category && ` • ${product.category.name}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {availableProducts.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No active products available. Create some products first.
            </p>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp Group Selection */}
      <Card>
        <CardHeader>
          <CardTitle>
            WhatsApp Groups ({formData.selectedGroupIds.length} selected)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {errors.groups && (
            <p className="text-sm text-destructive mb-4">{errors.groups}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
            {availableGroups
              .filter((g) => g.isActive)
              .map((group) => {
                const isSelected = formData.selectedGroupIds.includes(group.id);
                return (
                  <div
                    key={group.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg"
                  >
                    <Checkbox
                      id={`group-${group.id}`}
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        handleGroupToggle(group.id, checked as boolean)
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor={`group-${group.id}`}
                        className="font-medium cursor-pointer"
                      >
                        {group.name}
                      </Label>
                    </div>
                  </div>
                );
              })}
          </div>

          {availableGroups.filter((g) => g.isActive).length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No active WhatsApp groups available. Create some groups first.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Selected Items Summary */}
      {(formData.selectedProductIds.length > 0 ||
        formData.selectedGroupIds.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {formData.selectedProductIds.length > 0 && (
              <div className="mb-4">
                <Label className="text-sm font-medium">
                  Selected Products:
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.selectedProductIds.map((productId) => {
                    const product = getProduct(productId);
                    return (
                      <Badge key={productId} variant="secondary">
                        {product?.name || productId}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {formData.selectedGroupIds.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Selected Groups:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.selectedGroupIds.map((groupId) => {
                    const group = getGroup(groupId);
                    return (
                      <Badge key={groupId} variant="outline">
                        {group?.name || groupId}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Update Drop" : "Create Drop"}
        </Button>
      </div>
    </form>
  );
}
