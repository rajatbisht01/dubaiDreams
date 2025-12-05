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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

const FRIENDLY_LABELS = {
  "developers": "developer",
  "view-types": "view type",
  "property-types": "property type",
  "property-status": "property status",
  "communities": "community",
  "amenities": "amenity",
  "features": "feature",
  "nearby-categories": "nearby category",
  "document-types": "document type",
};

const LookupManager = ({ 
  title, 
  description, 
  endpoint, 
  icon, 
  hasLogo = false,
  onUpdate 
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "", logo_url: "" });

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch items
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/lookups/${endpoint}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
      }
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      toast.error(`Failed to load ${title}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [endpoint]);

  // Handle create/update
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      const url = editingItem
        ? `/api/admin/lookups/${endpoint}/${editingItem.id}`
        : `/api/admin/lookups/${endpoint}`;
      
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingItem ? "Updated successfully" : "Created successfully");
        setDialogOpen(false);
        setEditingItem(null);
        setFormData({ name: "", logo_url: "" });
        fetchItems();
        if (onUpdate) onUpdate();
      } else {
        toast.error(data.error || "Operation failed");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save");
    }
  };

  // Handle delete WITH CONTEXTUAL MESSAGING
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/lookups/${endpoint}/${deleteId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      const label = FRIENDLY_LABELS[endpoint] || "item";

      if (data.success) {
        toast.success("Deleted successfully");
        setDeleteDialogOpen(false);
        setDeleteId(null);
        fetchItems();
        if (onUpdate) onUpdate();
      } else {
        // Foreign key block
        if (data.error?.includes("used by a property")) {
          toast.error(`Cannot delete this ${label} because it is linked to one or more properties.`);
        } else {
          toast.error(data.error || "Delete failed");
        }
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete");
    }
  };

  // Open edit dialog
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      logo_url: item.logo_url || "",
    });
    setDialogOpen(true);
  };

  // Open create dialog
  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ name: "", logo_url: "" });
    setDialogOpen(true);
  };

  // Filter items
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {icon}
              <div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${title.toLowerCase()}...`}
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
                  {hasLogo && <TableHead>Logo</TableHead>}
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={hasLogo ? 3 : 2} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={hasLogo ? 3 : 2} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No results found" : `No ${title.toLowerCase()} yet`}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      {hasLogo && (
                        <TableCell>
                          {item.logo_url ? (
                            <img
                              src={item.logo_url}
                              alt={item.name}
                              className="h-8 w-auto object-contain"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">No logo</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeleteId(item.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Count */}
          <div className="mt-4 text-sm text-muted-foreground">
            Total: {filteredItems.length} {title.toLowerCase()}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? `Edit ${title}` : `Add New ${title}`}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? "Update the details below" : "Enter the details below"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder={`Enter ${title.toLowerCase()} name`}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            {hasLogo && (
              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                />
                {formData.logo_url && (
                  <div className="mt-2 p-4 border rounded-lg bg-secondary/20">
                    <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                    <img
                      src={formData.logo_url}
                      alt="Logo preview"
                      className="h-12 w-auto object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {title}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LookupManager;
