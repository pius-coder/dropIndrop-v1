"use client";

import React, { useState } from "react";
import Link from "next/link";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ImageIcon,
  Upload,
  Grid3X3,
  BarChart3,
  Plus,
  Search,
  Filter,
  Settings,
  Eye,
  Edit,
  Trash2,
  Download,
  Share,
  AlertCircle,
  CheckCircle,
  Image as ImageLucide,
  FileImage,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ImagesManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - will be replaced with real hooks
  const stats = {
    totalImages: 1247,
    activeImages: 1156,
    totalSize: "2.4 GB",
    categories: 12,
    recentUploads: 23,
    storageUsed: 68, // percentage
  };

  const recentImages = [
    {
      id: "1",
      filename: "product-hero-001.jpg",
      title: "Product Hero Image",
      size: "2.1 MB",
      dimensions: "1920x1080",
      category: "Products",
      uploadedBy: "Admin User",
      uploadDate: "2 hours ago",
      status: "active",
    },
    {
      id: "2",
      filename: "drop-banner-003.png",
      title: "Drop Banner",
      size: "1.8 MB",
      dimensions: "1200x600",
      category: "Drops",
      uploadedBy: "Manager",
      uploadDate: "5 hours ago",
      status: "active",
    },
    {
      id: "3",
      filename: "category-icon-007.svg",
      title: "Category Icon",
      size: "45 KB",
      dimensions: "256x256",
      category: "Categories",
      uploadedBy: "Admin User",
      uploadDate: "1 day ago",
      status: "inactive",
    },
  ];

  const quickActions = [
    {
      title: "Upload Images",
      description: "Add new images to your library",
      icon: Upload,
      href: "/admin/images/upload",
      color: "bg-blue-500",
    },
    {
      title: "Browse Gallery",
      description: "View and manage all images",
      icon: Grid3X3,
      href: "/admin/images/gallery",
      color: "bg-green-500",
    },
    {
      title: "View Analytics",
      description: "Image usage statistics",
      icon: BarChart3,
      href: "/admin/images/dashboard",
      color: "bg-purple-500",
    },
  ];

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="text-gray-600">
        <AlertCircle className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold">Image Management</h1>
          <p className="text-muted-foreground">
            Manage your platform's image library and assets
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => router.push("/admin/images/upload")}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Images</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Images</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalImages.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.activeImages.toLocaleString()} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <FileImage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSize}</div>
            <p className="text-xs text-muted-foreground">
              {stats.storageUsed}% of limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories}</div>
            <p className="text-xs text-muted-foreground">
              Organized collections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Uploads
            </CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentUploads}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common image management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className={cn("p-3 rounded-lg", action.color)}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Images Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Images</CardTitle>
          <CardDescription>
            Recently uploaded and modified images
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentImages.map((image) => (
              <div
                key={image.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <ImageLucide className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{image.title}</p>
                      {getStatusBadge(image.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {image.filename} • {image.size} • {image.dimensions}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Category: {image.category}</span>
                      <span>By: {image.uploadedBy}</span>
                      <span>{image.uploadDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing 3 of {stats.totalImages.toLocaleString()} images
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                View All Images
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Image Management Sections</CardTitle>
          <CardDescription>
            Navigate to different image management areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Overview Dashboard
                </h3>
                <p className="text-muted-foreground mb-4">
                  Get a comprehensive view of your image library
                </p>
                <div className="flex justify-center space-x-2">
                  <Button onClick={() => setActiveTab("gallery")}>
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    Browse Gallery
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("analytics")}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="mt-6">
              <div className="text-center py-12">
                <Grid3X3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Image Gallery</h3>
                <p className="text-muted-foreground mb-4">
                  Browse and manage all images in a beautiful grid layout
                </p>
                <Button onClick={() => router.push("/admin/images/gallery")}>
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Open Gallery
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="mt-6">
              <div className="text-center py-12">
                <Upload className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Images</h3>
                <p className="text-muted-foreground mb-4">
                  Upload new images with drag-and-drop functionality
                </p>
                <Button onClick={() => router.push("/admin/images/upload")}>
                  <Upload className="w-4 h-4 mr-2" />
                  Start Upload
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Analytics Dashboard
                </h3>
                <p className="text-muted-foreground mb-4">
                  View detailed statistics and insights about your images
                </p>
                <Button onClick={() => router.push("/admin/images/dashboard")}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
