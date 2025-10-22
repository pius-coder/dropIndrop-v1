"use client";

import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  Package,
  Users,
  AlertCircle,
  Loader2,
  X,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Drop form schema
const dropFormSchema = z.object({
  name: z.string().max(200, "Name too long").optional(),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  productIds: z
    .array(z.string())
    .min(1, "At least one product must be selected"),
  groupIds: z.array(z.string()).min(1, "At least one group must be selected"),
});

type DropFormData = z.infer<typeof dropFormSchema>;

interface Product {
  id: string;
  name: string;
  price: number;
  category: { name: string };
  images: string[];
}

interface WhatsAppGroup {
  id: string;
  name: string;
  isActive: boolean;
  memberCount?: number;
}

interface DropFormProps {
  initialData?: Partial<DropFormData>;
  products: Product[];
  groups: WhatsAppGroup[];
  onSubmit: (data: DropFormData) => Promise<void>;
  isSubmitting?: boolean;
}

/**
 * Drop Form Component for creating and editing drops
 */
export function DropForms({
  initialData,
  products,
  groups,
  onSubmit,
  isSubmitting = false,
}: DropFormProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    initialData?.productIds || []
  );
  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    initialData?.groupIds || []
  );

  const form = useForm<DropFormData>({
    resolver: zodResolver(dropFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      scheduledDate: initialData?.scheduledDate
        ? new Date(initialData.scheduledDate).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      productIds: initialData?.productIds || [],
      groupIds: initialData?.groupIds || [],
    },
  });

  // Handle product selection
  const handleProductToggle = useCallback(
    (productId: string, checked: boolean) => {
      const newSelection = checked
        ? [...selectedProducts, productId]
        : selectedProducts.filter((id) => id !== productId);

      setSelectedProducts(newSelection);
      form.setValue("productIds", newSelection);
    },
    [selectedProducts, form]
  );

  // Handle group selection
  const handleGroupToggle = useCallback(
    (groupId: string, checked: boolean) => {
      const newSelection = checked
        ? [...selectedGroups, groupId]
        : selectedGroups.filter((id) => id !== groupId);

      setSelectedGroups(newSelection);
      form.setValue("groupIds", newSelection);
    },
    [selectedGroups, form]
  );

  // Handle form submission
  const handleSubmit = async (data: DropFormData) => {
    try {
      // Convert string date to Date object for API
      const submitData = {
        ...data,
        scheduledDate: new Date(data.scheduledDate),
      };
      await onSubmit(submitData as any);
    } catch (error) {
      console.error("Form submission error:", error);
      form.setError("root", {
        type: "manual",
        message: "Failed to save drop. Please try again.",
      });
    }
  };

  // Filter active groups only
  const activeGroups = groups.filter((group) => group.isActive);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Drop Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Drop Name (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Summer Collection Drop"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled Date & Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Product Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Select Products ({selectedProducts.length} selected)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No products available. Please add products first.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={cn(
                      "border rounded-lg p-4 cursor-pointer transition-colors",
                      selectedProducts.includes(product.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    )}
                    onClick={() =>
                      handleProductToggle(
                        product.id,
                        !selectedProducts.includes(product.id)
                      )
                    }
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={cn(
                          "w-4 h-4 border rounded mt-1 cursor-pointer",
                          selectedProducts.includes(product.id)
                            ? "bg-primary border-primary"
                            : "border-border"
                        )}
                        onClick={() =>
                          handleProductToggle(
                            product.id,
                            !selectedProducts.includes(product.id)
                          )
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">
                            {product.name}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {product.category.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {product.price.toLocaleString()} XAF
                        </p>
                        {product.images.length > 0 && (
                          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {form.formState.errors.productIds && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {form.formState.errors.productIds.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* WhatsApp Group Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select WhatsApp Groups ({selectedGroups.length} selected)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeGroups.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No active WhatsApp groups available. Please configure groups
                  first.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {activeGroups.map((group) => (
                  <div
                    key={group.id}
                    className={cn(
                      "border rounded-lg p-4 cursor-pointer transition-colors",
                      selectedGroups.includes(group.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    )}
                    onClick={() =>
                      handleGroupToggle(
                        group.id,
                        !selectedGroups.includes(group.id)
                      )
                    }
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={cn(
                          "w-4 h-4 border rounded mt-1 cursor-pointer",
                          selectedGroups.includes(group.id)
                            ? "bg-primary border-primary"
                            : "border-border"
                        )}
                        onClick={() =>
                          handleGroupToggle(
                            group.id,
                            !selectedGroups.includes(group.id)
                          )
                        }
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{group.name}</h4>
                          <Badge variant="default" className="text-xs">
                            Active
                          </Badge>
                        </div>
                        {group.memberCount && (
                          <p className="text-sm text-muted-foreground">
                            {group.memberCount} members
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {form.formState.errors.groupIds && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {form.formState.errors.groupIds.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Drop Preview */}
        {selectedProducts.length > 0 && selectedGroups.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Drop Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    Scheduled for:{" "}
                    {form.watch("scheduledDate")?.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">
                      Products ({selectedProducts.length})
                    </h4>
                    <div className="space-y-1">
                      {selectedProducts.map((productId) => {
                        const product = products.find(
                          (p) => p.id === productId
                        );
                        return product ? (
                          <div
                            key={productId}
                            className="text-sm flex justify-between"
                          >
                            <span>{product.name}</span>
                            <span className="font-medium">
                              {product.price.toLocaleString()} XAF
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">
                      Groups ({selectedGroups.length})
                    </h4>
                    <div className="space-y-1">
                      {selectedGroups.map((groupId) => {
                        const group = activeGroups.find(
                          (g) => g.id === groupId
                        );
                        return group ? (
                          <div key={groupId} className="text-sm">
                            {group.name}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {form.formState.errors.root && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {form.formState.errors.root.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              selectedProducts.length === 0 ||
              selectedGroups.length === 0
            }
            className="w-full sm:w-auto"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Drop
          </Button>
        </div>
      </form>
    </Form>
  );
}
