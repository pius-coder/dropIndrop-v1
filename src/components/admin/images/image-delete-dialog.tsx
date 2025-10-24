import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Trash2,
  AlertTriangle,
  Image as ImageIcon,
  Package,
  ShoppingBag,
  CheckCircle,
} from "lucide-react";
import { useImageDelete } from "@/lib/hooks/use-image-management";

interface ImageDeleteDialogProps {
  image: {
    id: string;
    title?: string;
    filename: string;
    originalName: string;
    url: string;
  };
  associations?: {
    products: number;
    drops: number;
  };
  trigger?: React.ReactNode;
  onSuccess?: (imageId: string) => void;
  onError?: (error: string) => void;
}

export function ImageDeleteDialog({
  image,
  associations,
  trigger,
  onSuccess,
  onError,
}: ImageDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const deleteImage = useImageDelete();

  const handleDelete = async () => {
    try {
      await deleteImage.mutateAsync(image.id);
      onSuccess?.(image.id);
      setOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete image";
      onError?.(errorMessage);
    }
  };

  const hasAssociations =
    (associations?.products || 0) + (associations?.drops || 0) > 0;
  const canDelete = !hasAssociations;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="icon"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle>Delete Image</AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                Are you sure you want to delete this image? This action cannot
                be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {/* Image Preview */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {image.title || image.filename}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {image.filename}
              </p>
            </div>
          </div>

          {/* Associations Warning */}
          {hasAssociations && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Cannot delete image</p>
                  <p className="text-sm">
                    This image is associated with existing content and cannot be
                    deleted:
                  </p>
                  <div className="flex gap-2 mt-2">
                    {associations?.products && associations.products > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Package className="w-3 h-3 mr-1" />
                        {associations.products} Product
                        {associations.products !== 1 ? "s" : ""}
                      </Badge>
                    )}
                    {associations?.drops && associations.drops > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <ShoppingBag className="w-3 h-3 mr-1" />
                        {associations.drops} Drop
                        {associations.drops !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs mt-2">
                    Remove all associations before deleting the image.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Confirmation Warning */}
          {!hasAssociations && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will permanently delete the image file and remove it from
                all galleries. Make sure no products or drops are using this
                image before proceeding.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!canDelete || deleteImage.isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {deleteImage.isPending ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Image
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
