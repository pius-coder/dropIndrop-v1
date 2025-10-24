import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  X,
  Plus,
  Save,
  AlertCircle,
  Image as ImageIcon,
  Tag,
  Calendar,
  User,
} from "lucide-react";
import {
  useImageUpdate,
  useImageCategories,
} from "@/lib/hooks/use-image-management";
import {
  UpdateImageDataSchema,
  type UpdateImageData,
} from "@/lib/schemas/image-schema";

interface ImageEditModalProps {
  image: {
    id: string;
    title?: string;
    altText?: string;
    filename: string;
    originalName: string;
    url: string;
    size: number;
    mimeType: string;
    width?: number;
    height?: number;
    uploadedBy: string;
    createdAt: string;
    updatedAt: string;
    category?: {
      id: string;
      name: string;
    };
    tags: string[];
    isPublic: boolean;
    isActive: boolean;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (image: any) => void;
}

export function ImageEditModal({
  image,
  open,
  onOpenChange,
  onSuccess,
}: ImageEditModalProps) {
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const form = useForm<UpdateImageData>({
    resolver: zodResolver(UpdateImageDataSchema),
    defaultValues: {
      title: "",
      altText: "",
      categoryId: "",
      tags: [],
      isPublic: true,
      isActive: true,
    },
  });

  const { data: categories } = useImageCategories();
  const updateImage = useImageUpdate();

  // Reset form when image changes
  useEffect(() => {
    if (image) {
      setTags(image.tags || []);
      form.reset({
        title: image.title || "",
        altText: image.altText || "",
        categoryId: image.category?.id || "",
        tags: image.tags || [],
        isPublic: image.isPublic,
        isActive: image.isActive,
      });
    }
  }, [image, form]);

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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      form.setValue("tags", updatedTags);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    form.setValue("tags", updatedTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const onSubmit = async (data: UpdateImageData) => {
    if (!image) return;

    try {
      const result = await updateImage.mutateAsync({
        imageId: image.id,
        data: {
          ...data,
          tags,
        },
      });

      if (result) {
        onSuccess?.(result);
        onOpenChange(false);
        form.reset();
        setTags([]);
      }
    } catch (error) {
      console.error("Failed to update image:", error);
    }
  };

  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Edit Image Details
          </DialogTitle>
          <DialogDescription>
            Update image metadata, tags, and settings for "
            {image.title || image.filename}"
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Image Preview */}
          <div className="space-y-4">
            <div className="aspect-video relative overflow-hidden rounded-lg border bg-muted">
              <img
                src={image.url}
                alt={image.altText || image.title || image.originalName}
                className="object-cover w-full h-full"
              />
            </div>

            {/* Image Info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Filename:</span>
                <span className="font-mono">{image.filename}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Size:</span>
                <span>{formatFileSize(image.size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dimensions:</span>
                <span>
                  {image.width && image.height
                    ? `${image.width}x${image.height}`
                    : "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span>{image.mimeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uploaded by:</span>
                <span>{image.uploadedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Upload date:</span>
                <span>{formatDate(image.createdAt)}</span>
              </div>
              {image.updatedAt !== image.createdAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last updated:</span>
                  <span>{formatDate(image.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Edit Form */}
          <div className="space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter image title" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive title for the image
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="altText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alt Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the image for accessibility"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Alternative text for screen readers and accessibility
                      </FormDescription>
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
                          <SelectItem value="">No category</SelectItem>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Organize images into categories
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tags Section */}
                <div className="space-y-3">
                  <FormLabel>Tags</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <Button type="button" onClick={handleAddTag} size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:bg-muted rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormDescription>
                    Add tags to help organize and find images
                  </FormDescription>
                </div>

                <Separator />

                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Public Access</FormLabel>
                        <FormDescription>
                          Allow public access to this image
                        </FormDescription>
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

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>
                          Enable or disable this image
                        </FormDescription>
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

                {/* Error Display */}
                {updateImage.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {updateImage.error instanceof Error
                        ? updateImage.error.message
                        : "Failed to update image"}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Form Actions */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateImage.isPending}
                    className="min-w-[100px]"
                  >
                    {updateImage.isPending ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
