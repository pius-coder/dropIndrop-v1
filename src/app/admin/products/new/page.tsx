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
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/entities/product/presentation/product-forms";
import { useProductManagement } from "@/lib/hooks/use-product-management";

/**
 * New Product Page Component
 * Dedicated page for creating new products with full form validation
 */
export default function NewProductPage() {
  const router = useRouter();
  const { createProduct, categories, isCreating } = useProductManagement();

  const handleSubmit = async (data: any) => {
    try {
      await createProduct(data);
      router.push("/admin/products");
    } catch (error) {
      console.error("Failed to create product:", error);
      // Error handling is done in the hook
    }
  };

  const handleCancel = () => {
    router.push("/admin/products");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className=" flex items-start space-x-4 flex-col">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/products")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Product</h1>
          <p className="text-muted-foreground">
            Add a new product to your catalog
          </p>
        </div>
      </div>

      {/* Product Form */}
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            Fill in the details for your new product. All fields marked with *
            are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm
            categories={categories}
            onSubmit={handleSubmit}
            isSubmitting={isCreating}
          />
        </CardContent>
      </Card>
    </div>
  );
}
