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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// WhatsApp group form schema
const whatsappGroupFormSchema = z.object({
  name: z.string().min(1, "Group name is required").max(100, "Name too long"),
  chatId: z.string().min(1, "Chat ID is required"),
  description: z.string().max(500, "Description too long").optional(),
  memberCount: z.number().min(0, "Member count cannot be negative").optional(),
});

type WhatsAppGroupFormData = z.infer<typeof whatsappGroupFormSchema>;

interface WhatsAppGroup {
  id: string;
  name: string;
  chatId: string;
  description?: string;
  isActive: boolean;
  memberCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface WhatsAppConfigComponentProps {
  groups: WhatsAppGroup[];
  onCreateGroup: (data: WhatsAppGroupFormData) => Promise<void>;
  onUpdateGroup: (
    id: string,
    data: Partial<WhatsAppGroupFormData>
  ) => Promise<void>;
  onDeleteGroup: (id: string) => Promise<void>;
  onSyncGroups: () => Promise<void>;
  onCheckConnection: () => Promise<{ connected: boolean; error?: string }>;
  isLoading?: boolean;
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
  isSyncing?: boolean;
}

/**
 * WhatsApp Configuration Component
 * Manages WhatsApp groups and connection settings
 */
export function WhatsAppConfigComponent({
  groups,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onSyncGroups,
  onCheckConnection,
  isLoading = false,
  isCreating = false,
  isUpdating = false,
  isDeleting = false,
  isSyncing = false,
}: WhatsAppConfigComponentProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<WhatsAppGroup | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    error?: string;
  } | null>(null);

  const form = useForm<WhatsAppGroupFormData>({
    resolver: zodResolver(whatsappGroupFormSchema),
    defaultValues: {
      name: "",
      chatId: "",
      description: "",
      memberCount: 0,
    },
  });

  // Handle form submission
  const handleSubmit = async (data: WhatsAppGroupFormData) => {
    try {
      if (editingGroup) {
        await onUpdateGroup(editingGroup.id, data);
        setEditingGroup(null);
      } else {
        await onCreateGroup(data);
        setShowCreateDialog(false);
      }
      form.reset();
    } catch (error) {
      console.error("Form submission error:", error);
      form.setError("root", {
        type: "manual",
        message: "Failed to save group. Please try again.",
      });
    }
  };

  // Handle group deletion
  const handleDeleteGroup = async (groupId: string) => {
    if (confirm("Are you sure you want to delete this WhatsApp group?")) {
      try {
        await onDeleteGroup(groupId);
      } catch (error) {
        console.error("Failed to delete group:", error);
      }
    }
  };

  // Handle connection check
  const handleCheckConnection = async () => {
    try {
      const result = await onCheckConnection();
      setConnectionStatus(result);
    } catch (error) {
      console.error("Failed to check connection:", error);
      setConnectionStatus({
        connected: false,
        error: "Failed to check connection",
      });
    }
  };

  // Filter active groups
  const activeGroups = groups.filter((group) => group.isActive);
  const inactiveGroups = groups.filter((group) => !group.isActive);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading WhatsApp groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">WhatsApp Configuration</h2>
          <p className="text-muted-foreground">
            Manage WhatsApp groups and connection settings
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCheckConnection}
            className="flex items-center gap-2"
          >
            {connectionStatus?.connected ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            Check Connection
          </Button>
          <Button
            variant="outline"
            onClick={onSyncGroups}
            disabled={isSyncing}
            className="flex items-center gap-2"
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Sync Groups
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Group
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      {connectionStatus && (
        <Alert
          className={cn(
            connectionStatus.connected
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          )}
        >
          {connectionStatus.connected ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription
            className={cn(
              connectionStatus.connected ? "text-green-800" : "text-red-800"
            )}
          >
            {connectionStatus.connected
              ? "WhatsApp connection is active"
              : `WhatsApp connection error: ${connectionStatus.error}`}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groups.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGroups.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {groups.reduce((sum, group) => sum + (group.memberCount || 0), 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {groups.length > 0
                ? Math.round(
                    groups.reduce(
                      (sum, group) => sum + (group.memberCount || 0),
                      0
                    ) / groups.length
                  )
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Groups Table */}
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Groups</CardTitle>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No WhatsApp groups configured</p>
              <p className="text-sm">
                Add your first group or sync from WhatsApp
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group</TableHead>
                    <TableHead>Chat ID</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{group.name}</p>
                          {group.description && (
                            <p className="text-sm text-muted-foreground">
                              {group.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {group.chatId}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {group.memberCount || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={group.isActive ? "default" : "secondary"}
                        >
                          {group.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {group.createdAt.toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => setEditingGroup(group)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteGroup(group.id)}
                              className="text-red-600"
                              disabled={isDeleting}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Group Dialog */}
      <Dialog
        open={showCreateDialog || !!editingGroup}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingGroup(null);
            form.reset();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? "Edit Group" : "Add WhatsApp Group"}
            </DialogTitle>
            <DialogDescription>
              {editingGroup
                ? "Update group information and settings"
                : "Add a new WhatsApp group for drop distribution"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter group name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chatId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chat ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1234567890@g.us" {...field} />
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
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter group description"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="memberCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member Count (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setEditingGroup(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {(isCreating || isUpdating) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingGroup ? "Update Group" : "Create Group"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
