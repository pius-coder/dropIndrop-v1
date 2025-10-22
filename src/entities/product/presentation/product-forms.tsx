"use client";

import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  imageUploadService,
  type UploadResult,
} from "@/lib/services/image-upload-service";
import { cn } from "@/lib/utils";

// Product form schema
const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200, "Name too long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description too long"),
  price: z
    .number()
    .min(0, "Price must be positive")
    .max(1000000, "Price too high"),
  sku: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  stockQuantity: z.number().min(0, "Stock cannot be negative").default(0),
  images: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  categories: Array<{ id: string; name: string }>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isSubmitting?: boolean;
}

interface ImageUploadState {
  file: File;
  preview: string;
  uploading: boolean;
  result?: UploadResult;
}

/**
 * Product Form Component with Image Upload
 */
export function ProductForm({
  initialData,
  categories,
  onSubmit,
  isSubmitting = false,
}: ProductFormProps) {
  const [imageUploads, setImageUploads] = useState<ImageUploadState[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      sku: initialData?.sku || "",
      categoryId: initialData?.categoryId || "",
      stockQuantity: initialData?.stockQuantity || 0,
      images: initialData?.images || [],
      isActive: initialData?.isActive ?? true,
    },
  });

  // Handle file selection
  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const validFiles: File[] = [];
      const invalidFiles: string[] = [];

      // Validate files before processing
      Array.from(files).forEach((file) => {
        if (!imageUploadService.isFileTypeSupported(file)) {
          invalidFiles.push(`${file.name}: Unsupported file type`);
        } else if (!imageUploadService.isFileSizeValid(file)) {
          invalidFiles.push(
            `${
              file.name
            }: File too large (max ${imageUploadService.getMaxFileSizeMB()}MB)`
          );
        } else {
          validFiles.push(file);
        }
      });

      // Show validation errors if any
      if (invalidFiles.length > 0) {
        form.setError("root", {
          type: "manual",
          message: `Invalid files:\n${invalidFiles.join("\n")}`,
        });
        return;
      }

      const newUploads: ImageUploadState[] = validFiles.map((file) => ({
        file,
        preview: imageUploadService.createPreviewUrl(file),
        uploading: false,
      }));

      setImageUploads((prev) => [...prev, ...newUploads]);

      // Auto-upload files
      for (const upload of newUploads) {
        await uploadImage(upload);
      }
    },
    [form]
  );

  // Upload single image
  const uploadImage = useCallback(
    async (uploadState: ImageUploadState) => {
      setImageUploads((prev) =>
        prev.map((u) =>
          u.file === uploadState.file ? { ...u, uploading: true } : u
        )
      );

      try {
        const result = await imageUploadService.uploadImage(uploadState.file);

        setImageUploads((prev) =>
          prev.map((u) => {
            if (u.file === uploadState.file) {
              if (result.success && result.url) {
                // Add to form images
                const currentImages = form.getValues("images") || [];
                form.setValue("images", [...currentImages, result.url]);
              }
              return { ...u, uploading: false, result };
            }
            return u;
          })
        );
      } catch (error) {
        console.error("Image upload error:", error);
        setImageUploads((prev) =>
          prev.map((u) =>
            u.file === uploadState.file
              ? {
                  ...u,
                  uploading: false,
                  result: { success: false, error: "Upload failed" },
                }
              : u
          )
        );
      }
    },
    [form]
  );

  // Remove image
  const removeImage = useCallback(
    (index: number) => {
      const upload = imageUploads[index];
      if (upload) {
        // Revoke preview URL
        imageUploadService.revokePreviewUrl(upload.preview);

        // Remove from form images
        const currentImages = form.getValues("images") || [];
        const updatedImages = currentImages.filter((_, i) => i !== index);
        form.setValue("images", updatedImages);
      }

      setImageUploads((prev) => prev.filter((_, i) => i !== index));
    },
    [imageUploads, form]
  );

  // Handle form submission with image validation
  const handleSubmit = async (data: ProductFormData) => {
    try {
      // Validate that at least one image is uploaded
      if (!data.images || data.images.length === 0) {
        form.setError("images", {
          type: "manual",
          message: "At least one product image is required",
        });
        return;
      }

      // Check if any uploads are still in progress
      const uploadingImages = imageUploads.filter((u) => u.uploading);
      if (uploadingImages.length > 0) {
        form.setError("root", {
          type: "manual",
          message: "Please wait for all image uploads to complete",
        });
        return;
      }

      // Check for failed uploads
      const failedUploads = imageUploads.filter((u) => u.result?.error);
      if (failedUploads.length > 0) {
        form.setError("root", {
          type: "manual",
          message:
            "Some images failed to upload. Please remove failed uploads and try again.",
        });
        return;
      }

      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
      // Show error message to user
      form.setError("root", {
        type: "manual",
        message: "Failed to save product. Please try again.",
      });
    }
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [handleFileSelect]
  );

  // Enhanced handleSubmit with image validation
  const handleSubmitWithValidation = async (data: ProductFormData) => {
    try {
      // Validate that at least one image is uploaded
      if (!data.images || data.images.length === 0) {
        form.setError("images", {
          type: "manual",
          message: "At least one product image is required",
        });
        return;
      }

      // Check if any uploads are still in progress
      const uploadingImages = imageUploads.filter((u) => u.uploading);
      if (uploadingImages.length > 0) {
        form.setError("root", {
          type: "manual",
          message: "Please wait for all image uploads to complete",
        });
        return;
      }

      // Check for failed uploads
      const failedUploads = imageUploads.filter((u) => u.result?.error);
      if (failedUploads.length > 0) {
        form.setError("root", {
          type: "manual",
          message:
            "Some images failed to upload. Please remove failed uploads and try again.",
        });
        return;
      }

      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
      // Show error message to user
      form.setError("root", {
        type: "manual",
        message: "Failed to save product. Please try again.",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmitWithValidation)}
        className="space-y-6"
      >
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter product description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (XAF)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stockQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter SKU" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Make this product visible to customers
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload Area */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25",
                "hover:border-primary hover:bg-primary/5"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Drag and drop images here, or click to select
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports JPEG, PNG, WebP up to 5MB each
                </p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                id="image-upload"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                Select Images
              </Button>
            </div>

            {/* Image Preview Grid */}
            {imageUploads.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {imageUploads.map((upload, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border">
                      <img
                        src={upload.preview}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Upload Status Overlay */}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {upload.uploading && (
                        <div className="flex flex-col items-center text-white">
                          <Loader2 className="h-6 w-6 animate-spin mb-2" />
                          <span className="text-xs">Uploading...</span>
                        </div>
                      )}

                      {upload.result?.success && (
                        <div className="flex flex-col items-center text-green-400">
                          <CheckCircle className="h-6 w-6 mb-2" />
                          <span className="text-xs">Uploaded</span>
                        </div>
                      )}

                      {upload.result?.error && (
                        <div className="flex flex-col items-center text-red-400">
                          <AlertCircle className="h-6 w-6 mb-2" />
                          <span className="text-xs">Failed</span>
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Progress */}
            {imageUploads.some((u) => u.uploading) && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading images...</span>
                  <span>
                    {imageUploads.filter((u) => u.result?.success).length} /{" "}
                    {imageUploads.length}
                  </span>
                </div>
                <Progress
                  value={
                    (imageUploads.filter((u) => u.result?.success).length /
                      imageUploads.length) *
                    100
                  }
                  className="w-full"
                />
              </div>
            )}

            {/* Image Validation Error */}
            {form.formState.errors.images && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {form.formState.errors.images.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

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
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
