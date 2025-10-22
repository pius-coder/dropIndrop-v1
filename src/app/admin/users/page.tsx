"use client";

import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Eye,
  UserCheck,
  UserX,
  MoreHorizontal,
} from "lucide-react";
import { UserRole } from "@prisma/client";
// import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  email?: string;
  phoneNumber: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface UserAnalytics {
  totalOrders: number;
  deliveredOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string | null;
}

interface UserWithAnalytics extends User {
  analytics?: UserAnalytics;
  purchaseHistory?: {
    userId: string;
    username: string;
    purchaseHistory: any[];
    totalOrders: number;
    totalSpent: number;
  };
}

interface CreateUserData {
  username: string;
  email?: string;
  phoneNumber: string;
  password: string;
  role: UserRole;
}

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserWithAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithAnalytics | null>(
    null
  );
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Create user form state
  const [createForm, setCreateForm] = useState<CreateUserData>({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: UserRole.CLIENT,
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (roleFilter !== "ALL") params.append("role", roleFilter);

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      console.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter]);

  // Create user
  const handleCreateUser = async () => {
    try {
      setIsCreateLoading(true);
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create user");
      }

      console.log("User created successfully");
      setIsCreateDialogOpen(false);
      setCreateForm({
        username: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: UserRole.CLIENT,
      });
      fetchUsers();
    } catch (error: any) {
      console.error("Failed to create user:", error.message);
    } finally {
      setIsCreateLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete user");
      }

      console.log("User deleted successfully");
      fetchUsers();
    } catch (error: any) {
      console.error("Failed to delete user:", error.message);
    }
  };

  // Toggle user status
  const handleToggleUserStatus = async (
    userId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user");
      }

      console.log(
        `User ${!currentStatus ? "activated" : "deactivated"} successfully`
      );
      fetchUsers();
    } catch (error: any) {
      console.error("Failed to create user:", error.message);
    }
  };

  // View user details
  const handleViewUser = async (user: User) => {
    try {
      setIsDetailLoading(true);
      setSelectedUser(null);

      const response = await fetch(`/api/admin/users/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch user details");

      const data = await response.json();
      if (data.success) {
        setSelectedUser(data.data);
      }
    } catch (error) {
      console.error("Failed to load user details:", error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber.includes(searchTerm);

    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "destructive";
      case UserRole.ADMIN:
        return "default";
      case UserRole.DELIVERY_MANAGER:
        return "secondary";
      case UserRole.CLIENT:
        return "outline";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-col gap-1.5">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the platform with specified role and
                permissions.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={createForm.username}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, username: e.target.value })
                  }
                  placeholder="Enter username"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                  placeholder="Enter email (optional)"
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={createForm.phoneNumber}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      phoneNumber: e.target.value,
                    })
                  }
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, password: e.target.value })
                  }
                  placeholder="Enter password"
                />
              </div>

              <div>
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={createForm.role}
                  onValueChange={(value: UserRole) =>
                    setCreateForm({ ...createForm, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.CLIENT}>Client</SelectItem>
                    <SelectItem value={UserRole.DELIVERY_MANAGER}>
                      Delivery Manager
                    </SelectItem>
                    <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                    <SelectItem value={UserRole.SUPER_ADMIN}>
                      Super Admin
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateUser}
                disabled={
                  isCreateLoading ||
                  !createForm.username ||
                  !createForm.phoneNumber ||
                  !createForm.password
                }
              >
                {isCreateLoading ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={roleFilter}
              onValueChange={(value: UserRole | "ALL") => setRoleFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value={UserRole.CLIENT}>Client</SelectItem>
                <SelectItem value={UserRole.DELIVERY_MANAGER}>
                  Delivery Manager
                </SelectItem>
                <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                <SelectItem value={UserRole.SUPER_ADMIN}>
                  Super Admin
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Users ({filteredUsers.length})</span>
          </CardTitle>
          <CardDescription>
            Manage user accounts, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.email || user.phoneNumber}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.isActive ? "default" : "secondary"}
                      className={
                        user.isActive ? "bg-green-100 text-green-800" : ""
                      }
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewUser(user)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleToggleUserStatus(user.id, user.isActive)
                        }
                      >
                        {user.isActive ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete user "
                              {user.username}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected user
            </DialogDescription>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : selectedUser ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Username</Label>
                  <p className="text-sm">{selectedUser.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                    {selectedUser.role.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">
                    {selectedUser.email || "Not provided"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone Number</Label>
                  <p className="text-sm">{selectedUser.phoneNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge
                    variant={selectedUser.isActive ? "default" : "secondary"}
                    className={
                      selectedUser.isActive ? "bg-green-100 text-green-800" : ""
                    }
                  >
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Analytics */}
              {selectedUser.analytics && (
                <div>
                  <h4 className="font-medium mb-3">Analytics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">
                        Total Orders
                      </Label>
                      <p className="text-2xl font-bold">
                        {selectedUser.analytics.totalOrders}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Total Spent</Label>
                      <p className="text-2xl font-bold">
                        ${selectedUser.analytics.totalSpent.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Average Order Value
                      </Label>
                      <p className="text-lg">
                        ${selectedUser.analytics.averageOrderValue.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Order</Label>
                      <p className="text-sm">
                        {selectedUser.analytics.lastOrderDate
                          ? new Date(
                              selectedUser.analytics.lastOrderDate
                            ).toLocaleDateString()
                          : "No orders"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Purchase History */}
              {selectedUser.purchaseHistory && (
                <div>
                  <h4 className="font-medium mb-3">Recent Orders</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedUser.purchaseHistory.purchaseHistory
                      .slice(0, 5)
                      .map((order: any) => (
                        <div
                          key={order.orderId}
                          className="flex items-center justify-between p-3 border rounded"
                        >
                          <div>
                            <p className="font-medium">#{order.orderNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.items.length} items •{" "}
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              ${order.totalAmount.toFixed(2)}
                            </p>
                            <Badge variant="outline">{order.status}</Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
