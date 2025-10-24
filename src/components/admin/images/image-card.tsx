import React, { useState } from "react";
import Image from "next/image";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Eye,
  Edit,
  Trash2,
  Download,
  Share,
  MoreVertical,
  Calendar,
  User,
  Tag,
  ImageIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageCardProps {
  image: {
    id: string;
    title?: string;
    altText?: string;
    filename: string;
    originalName: string;
    url: string;
    thumbUrl?: string;
    size: number;
    mimeType: string;
    width?: number;
    height?: number;
    uploadedBy: string;
    createdAt: string;
    category?: {
      id: string;
      name: string;
    };
    tags: string[];
    isPublic: boolean;
    isActive: boolean;
  };
  onEdit?: (imageId: string) => void;
  onDelete?: (imageId: string) => void;
  onView?: (imageId: string) => void;
  className?: string;
}

export function ImageCard({
  image,
  onEdit,
  onDelete,
  onView,
  className,
}: ImageCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = () => {
    if (!image.isActive) {
      return (
        <Badge variant="outline" className="text-gray-600">
          <AlertCircle className="w-3 h-3 mr-1" />
          Inactive
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
    );
  };

  const getMimeTypeBadge = () => {
    const type = image.mimeType.split("/")[1].toUpperCase();
    return (
      <Badge variant="outline" className="text-xs">
        {type}
      </Badge>
    );
  };

  return (
    <Card
      className={cn(
        "group overflow-hidden transition-all hover:shadow-lg",
        className
      )}
    >
      {/* Image Preview */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {!imageError ? (
          <Image
            src={image.thumbUrl || image.url}
            alt={image.altText || image.title || image.originalName}
            fill
            className={cn(
              "object-cover transition-all group-hover:scale-105",
              !isImageLoaded && "opacity-0"
            )}
            onError={() => setImageError(true)}
            onLoad={() => setIsImageLoaded(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted">
            <ImageIcon className="w-12 h-12 text-muted-foreground" />
          </div>
        )}

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="icon"
            variant="secondary"
            onClick={() => onView?.(image.id)}
            className="h-10 w-10"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={() => window.open(image.url, "_blank")}
            className="h-10 w-10"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>

        {/* Status and Type Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          {getStatusBadge()}
          {getMimeTypeBadge()}
        </div>

        {/* Privacy Badge */}
        <div className="absolute top-2 right-2">
          <Badge
            variant={image.isPublic ? "default" : "outline"}
            className={cn(
              "text-xs",
              image.isPublic
                ? "bg-blue-100 text-blue-800 border-blue-200"
                : "bg-gray-100 text-gray-800 border-gray-200"
            )}
          >
            {image.isPublic ? "Public" : "Private"}
          </Badge>
        </div>
      </div>

      {/* Card Content */}
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title and Actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className="font-semibold truncate"
                title={image.title || image.filename}
              >
                {image.title || image.filename}
              </h3>
              <p
                className="text-sm text-muted-foreground truncate"
                title={image.filename}
              >
                {image.filename}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onView?.(image.id)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(image.id)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Image
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => window.open(image.url, "_blank")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(image.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Image Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Size</p>
              <p className="font-medium">{formatFileSize(image.size)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Dimensions</p>
              <p className="font-medium">
                {image.width && image.height
                  ? `${image.width}x${image.height}`
                  : "Unknown"}
              </p>
            </div>
          </div>

          {/* Category and Tags */}
          <div className="space-y-2">
            {image.category && (
              <div className="flex items-center gap-2 text-sm">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Category:</span>
                <Badge variant="outline">{image.category.name}</Badge>
              </div>
            )}

            {image.tags && image.tags.length > 0 && (
              <div className="flex items-start gap-2 text-sm">
                <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {image.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {image.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{image.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{image.uploadedBy}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(image.createdAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
