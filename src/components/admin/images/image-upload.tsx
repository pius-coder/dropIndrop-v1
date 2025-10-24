import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle,
  AlertCircle,
  FileImage,
  Plus,
} from "lucide-react";
import {
  useImageUpload,
  useImageCategories,
} from "@/lib/hooks/use-image-management";
import { cn } from "@/lib/utils";

interface UploadedFile extends File {
  id: string;
  preview: string;
  status: "pending" | "uploading" | "success" | "error";
  progress?: number;
  error?: string;
}

interface ImageUploadProps {
  onSuccess?: (images: any[]) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  categoryId?: string;
  className?: string;
}

export function ImageUpload({
  onSuccess,
  onError,
  maxFiles = 10,
  maxSize = 10,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  categoryId,
  className,
}: ImageUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const uploadImages = useImageUpload();
  const { data: categories } = useImageCategories();

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map((file) => {
          const errors = file.errors
            .map((error: any) => error.message)
            .join(", ");
          return `${file.file.name}: ${errors}`;
        });

        onError?.(errors.join("\n"));
        return;
      }

      // Convert files to UploadedFile format
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        ...file,
        id: Math.random().toString(36).substr(2, 9),
        preview: URL.createObjectURL(file),
        status: "pending",
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);
    },
    [onError]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive: dropzoneIsDragActive,
  } = useDropzone({
    onDrop,
    accept: {
      "image/*": acceptedTypes,
    },
    maxSize: maxSize * 1024 * 1024,
    maxFiles: maxFiles - uploadedFiles.length,
    disabled: uploadImages.isPending || uploadedFiles.length >= maxFiles,
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const uploadAllFiles = async () => {
    const filesToUpload = uploadedFiles.filter((f) => f.status === "pending");

    if (filesToUpload.length === 0) return;

    // Mark files as uploading
    setUploadedFiles((prev) =>
      prev.map((file) =>
        file.status === "pending" ? { ...file, status: "uploading" } : file
      )
    );

    try {
      const result = await uploadImages.mutateAsync({
        files: filesToUpload,
        metadata: {
          categoryId: categoryId || undefined,
          tags: [],
          isPublic: true,
        },
      });

      // Mark files as success
      setUploadedFiles((prev) =>
        prev.map((file) => {
          const uploadedImage = result.find(
            (img: any) => img.originalName === file.name
          );
          return uploadedImage
            ? { ...file, status: "success" }
            : { ...file, status: "error", error: "Upload failed" };
        })
      );

      onSuccess?.(result);

      // Clean up successful uploads after a delay
      setTimeout(() => {
        setUploadedFiles((prev) => {
          const remaining = prev.filter((f) => f.status !== "success");
          // Clean up preview URLs
          prev.forEach((file) => {
            if (file.preview) URL.revokeObjectURL(file.preview);
          });
          return remaining;
        });
      }, 2000);
    } catch (error) {
      // Mark files as error
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.status === "uploading"
            ? {
                ...file,
                status: "error",
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : file
        )
      );

      onError?.(error instanceof Error ? error.message : "Upload failed");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "uploading":
        return (
          <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        );
      default:
        return <ImageIcon className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "border-green-200 bg-green-50";
      case "error":
        return "border-red-200 bg-red-50";
      case "uploading":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Images
          </CardTitle>
          <CardDescription>
            Drag and drop images here, or click to select files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              dropzoneIsDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50",
              uploadImages.isPending || uploadedFiles.length >= maxFiles
                ? "pointer-events-none opacity-50"
                : ""
            )}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <FileImage className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  {dropzoneIsDragActive
                    ? "Drop images here"
                    : "Drag & drop images"}
                </p>
                <p className="text-muted-foreground">
                  or{" "}
                  <Button variant="link" className="p-0 h-auto font-medium">
                    browse files
                  </Button>
                </p>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  Maximum {maxFiles} files, up to {maxSize}MB each
                </p>
                <p>Supported formats: JPEG, PNG, WebP, GIF</p>
                {categories && categories.length > 0 && (
                  <p>Optional: Assign to categories</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadImages.isPending && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading images...</span>
                <span className="text-sm text-muted-foreground">
                  {uploadedFiles.filter((f) => f.status === "success").length} /{" "}
                  {
                    uploadedFiles.filter(
                      (f) => f.status === "uploading" || f.status === "success"
                    ).length
                  }
                </span>
              </div>
              <Progress
                value={
                  (uploadedFiles.filter((f) => f.status === "success").length /
                    uploadedFiles.filter(
                      (f) => f.status === "uploading" || f.status === "success"
                    ).length) *
                  100
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Files ({uploadedFiles.length})</CardTitle>
            <CardDescription>
              Review and manage files before uploading
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border",
                    getStatusColor(file.status)
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{file.name}</p>
                      {getStatusIcon(file.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    {file.status === "error" && file.error && (
                      <p className="text-sm text-red-600">{file.error}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {file.status === "success" && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Uploaded
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(file.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Upload Actions */}
              {uploadedFiles.some((f) => f.status === "pending") && (
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {uploadedFiles.filter((f) => f.status === "pending").length}{" "}
                    files ready to upload
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setUploadedFiles([]);
                        uploadedFiles.forEach((file) => {
                          if (file.preview) URL.revokeObjectURL(file.preview);
                        });
                      }}
                    >
                      Clear All
                    </Button>
                    <Button
                      onClick={uploadAllFiles}
                      disabled={uploadImages.isPending}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload All
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {uploadImages.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {uploadImages.error instanceof Error
              ? uploadImages.error.message
              : "Failed to upload images"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
