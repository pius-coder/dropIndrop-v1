"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Folder,
  FolderOpen,
  AlertCircle,
  Loader2,
  ChevronRight,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Category type for the UI
interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
}

// Category hierarchy type
interface CategoryNode {
  category: Category;
  children: CategoryNode[];
  level: number;
}

/**
 * Category Management Page Component
 * Features hierarchical category display with CRUD operations
 */
export default function CategoryManagementPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    description: "",
    parentId: "",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
  });

  // State for managing expanded/collapsed categories
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  // Fetch categories from API
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const response = await fetch("/api/admin/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      return data.data;
    },
  });

  // Build category hierarchy
  const buildCategoryHierarchy = (categories: Category[]): CategoryNode[] => {
    const categoryMap = new Map<string, CategoryNode>();
    const rootNodes: CategoryNode[] = [];

    // First pass: create all nodes
    categories.forEach((category) => {
      categoryMap.set(category.id, {
        category,
        children: [],
        level: 0,
      });
    });

    // Second pass: build hierarchy
    categories.forEach((category) => {
      const node = categoryMap.get(category.id)!;

      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(node);
          node.level = parent.level + 1;
        }
      } else {
        rootNodes.push(node);
      }
    });

    // Sort by sortOrder
    const sortNodes = (nodes: CategoryNode[]): CategoryNode[] => {
      return nodes
        .sort((a, b) => a.category.sortOrder - b.category.sortOrder)
        .map((node) => ({
          ...node,
          children: sortNodes(node.children),
        }));
    };

    return sortNodes(rootNodes);
  };

  const categoryHierarchy = buildCategoryHierarchy(categories);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categoryHierarchy;

    const filterNodes = (nodes: CategoryNode[]): CategoryNode[] => {
      return nodes
        .filter(
          (node) =>
            node.category.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            node.category.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
        )
        .map((node) => ({
          ...node,
          children: filterNodes(node.children),
        }))
        .filter(
          (node) =>
            node.children.length > 0 ||
            node.category.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    return filterNodes(categoryHierarchy);
  }, [categoryHierarchy, searchTerm]);

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: typeof createFormData) => {
      console.log("Creating category:", data);
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        console.error("Category creation failed:", result);
        throw new Error(result.error || "Failed to create category");
      }

      console.log("Category created successfully:", result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsCreateDialogOpen(false);
      setCreateFormData({ name: "", description: "", parentId: "" });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: typeof editFormData;
    }) => {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update category");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCategory(null);
      setEditFormData({ name: "", description: "" });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete category");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const handleCreateCategory = async () => {
    if (!createFormData.name.trim()) return;
    try {
      await createCategoryMutation.mutateAsync(createFormData);
    } catch (error) {
      console.error("Failed to create category:", error);
      // The error message will be displayed via the mutation error state
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editFormData.name.trim()) return;
    try {
      await updateCategoryMutation.mutateAsync({
        id: editingCategory.id,
        data: editFormData,
      });
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategoryMutation.mutateAsync(categoryId);
      } catch (error) {
        console.error("Failed to delete category:", error);
      }
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditFormData({
      name: category.name,
      description: category.description || "",
    });
  };

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const renderCategoryRow = (
    node: CategoryNode,
    isLast: boolean = false
  ): React.ReactNode => {
    const { category, children, level } = node;
    const hasChildren = children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <React.Fragment key={category.id}>
        <TableRow className="hover:bg-muted/50">
          <TableCell>
            <div className="flex items-center">
              {/* Improved indentation using shadcn/ui spacing */}
              <div
                className="flex-shrink-0 relative"
                style={{ width: `${level * 16}px` }}
              >
                {Array.from({ length: level }).map((_, index) => (
                  <div
                    key={index}
                    className="absolute top-0 w-px bg-border h-full"
                    style={{
                      left: `${index * 16 + 10}px`,
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {hasChildren ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-muted flex-shrink-0"
                    onClick={() => toggleCategoryExpansion(category.id)}
                  >
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded && "rotate-90"
                      )}
                    />
                  </Button>
                ) : (
                  <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                  </div>
                )}

                {/* Improved folder icons using shadcn/ui colors */}
                <div className="flex-shrink-0">
                  {hasChildren ? (
                    isExpanded ? (
                      <FolderOpen className="h-5 w-5 text-primary" />
                    ) : (
                      <Folder className="h-5 w-5 text-muted-foreground" />
                    )
                  ) : (
                    <div className="h-5 w-5 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-sm bg-muted-foreground/30" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground truncate">
                      {category.name}
                    </p>
                    {hasChildren && (
                      <Badge variant="secondary" className="text-xs">
                        {children.length}
                      </Badge>
                    )}
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Badge variant="outline" className="text-xs">
              {category.productCount || 0} products
            </Badge>
          </TableCell>
          <TableCell>
            <Badge
              variant={category.isActive ? "default" : "secondary"}
              className={cn(
                "text-xs",
                category.isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {category.isActive ? "Active" : "Inactive"}
            </Badge>
          </TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Category
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Category
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>

        {/* Render children only if expanded */}
        {hasChildren && isExpanded && (
          <>
            {children.map((child, index) =>
              renderCategoryRow(child, index === children.length - 1)
            )}
          </>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Category Management
          </h1>
          <p className="text-muted-foreground">
            Organize your products with hierarchical categories
          </p>
        </div>

        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Categories
            </CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Root Categories
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categoriesLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                categories.filter((c) => !c.parentId).length
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Categories
            </CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categoriesLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                categories.filter((c) => c.isActive).length
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.reduce((sum, c) => sum + (c.productCount || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Manage your category hierarchy and organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Categories Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Products</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoriesLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading categories...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : categoriesError ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex flex-col items-center text-red-600">
                        <AlertCircle className="h-12 w-12 mb-4" />
                        <p>Failed to load categories</p>
                        <p className="text-sm">
                          {categoriesError instanceof Error
                            ? categoriesError.message
                            : "Please try again later"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex flex-col items-center text-muted-foreground">
                        <Folder className="h-12 w-12 mb-4" />
                        <p>No categories found</p>
                        <p className="text-sm">
                          {searchTerm
                            ? "Try adjusting your search"
                            : "Get started by adding your first category"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((node) => renderCategoryRow(node))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Category Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category to organize your products
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Error Display */}
            {createCategoryMutation.error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {createCategoryMutation.error.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Category Name</label>
              <Input
                placeholder="Enter category name"
                value={createFormData.name}
                onChange={(e) =>
                  setCreateFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Description (Optional)
              </label>
              <Input
                placeholder="Enter category description"
                value={createFormData.description}
                onChange={(e) =>
                  setCreateFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Parent Category (Optional)
              </label>
              <select
                value={createFormData.parentId}
                onChange={(e) =>
                  setCreateFormData((prev) => ({
                    ...prev,
                    parentId: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">No parent category</option>
                {categoriesLoading ? (
                  <option disabled>Loading categories...</option>
                ) : (
                  categories
                    .filter((c) => !c.parentId)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                )}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setCreateFormData({
                    name: "",
                    description: "",
                    parentId: "",
                  });
                }}
                disabled={createCategoryMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCategory}
                disabled={
                  createCategoryMutation.isPending ||
                  !createFormData.name.trim()
                }
              >
                {createCategoryMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog
        open={!!editingCategory}
        onOpenChange={(open) => {
          if (!open) {
            setEditingCategory(null);
            setEditFormData({ name: "", description: "" });
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update category information and settings
            </DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category Name</label>
                <Input
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter category name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter category description"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingCategory(null);
                    setEditFormData({ name: "", description: "" });
                  }}
                  disabled={updateCategoryMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateCategory}
                  disabled={
                    updateCategoryMutation.isPending ||
                    !editFormData.name.trim()
                  }
                >
                  {updateCategoryMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Category
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
