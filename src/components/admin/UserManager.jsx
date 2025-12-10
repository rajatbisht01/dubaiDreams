"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ShieldCheck, UserCog, Mail, Calendar } from "lucide-react";
import { toast } from "sonner";

const UserManager = ({ onUpdate }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle role update
  const handleUpdateRole = async () => {
    if (!newRole) {
      toast.error("Please select a role");
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Role updated successfully");
        setDialogOpen(false);
        setSelectedUser(null);
        setNewRole("");
        fetchUsers();
        if (onUpdate) onUpdate();
      } else {
        toast.error(data.error || "Failed to update role");
      }
    } catch (err) {
      console.error("Update role error:", err);
      toast.error("Failed to update role");
    }
  };

  // Open role dialog
  const handleChangeRole = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setDialogOpen(true);
  };

  // Filter users
  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Role badge color
  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "superAdmin":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5" />
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage user roles and permissions
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No users found" : "No users yet"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.full_name || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(user.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleChangeRole(user)}
                        >
                          <UserCog className="h-4 w-4 mr-1" />
                          Change Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Count & Stats */}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div>Total: {filteredUsers.length} users</div>
            <div className="flex gap-4">
              <span>
                SuperAdmins: {users.filter(u => u.role === "superAdmin").length}
              </span>
              <span>
                Admins: {users.filter(u => u.role === "admin").length}
              </span>
              <span>
                Users: {users.filter(u => u.role === "user").length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Role Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role">Select Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                      <span>User</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="superAdmin">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                      <span>Super Admin</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role Descriptions */}
            <div className="space-y-2 text-sm">
              <div className="p-3 rounded-lg bg-secondary/20">
                <p className="font-semibold mb-1">Role Permissions:</p>
                {newRole === "user" && (
                  <p className="text-muted-foreground">
                    Can view properties and save favorites
                  </p>
                )}
                {newRole === "admin" && (
                  <p className="text-muted-foreground">
                    Can manage properties and lookup tables
                  </p>
                )}
                {newRole === "superAdmin" && (
                  <p className="text-muted-foreground">
                    Full access including user management and system settings
                  </p>
                )}
              </div>
            </div>

            {/* Current User Info */}
            {selectedUser && (
              <div className="border-t pt-4 space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Current Role: </span>
                  <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Email: {selectedUser.email}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button className='bg-brand' onClick={handleUpdateRole}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManager;