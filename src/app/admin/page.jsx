"use client";

import React, { useState, useEffect } from "react";
import AdminDrawerForm from "@/components/admin/AdminDrawerForm";
import PropertyGrid from "@/components/property/PropertyGrid";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import PropertyStepperForm from "@/components/admin/PropertyStepperForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AdminPage = () => {
  const [items, setItems] = useState([]);
  const [drawerItem, setDrawerItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Load list
  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/properties", { method: "GET" });
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Invalid data");
      setItems(data);
    } catch (err) {
      console.error("[AdminPage] fetchData error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await fetch(`/api/admin/properties/${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setShowConfirm(false);
      fetchData();
    } catch (err) {
      console.error("Delete failed:", err);
      setShowConfirm(false);
    }
  };

  const handleEdit = (item) => setDrawerItem(item);

  return (
    <div className="p-8">

      {/* Add Property */}
      <div className="mb-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setDrawerItem({})}
        >
          Add Property
        </button>
      </div>

      {/* Grid */}
      <PropertyGrid
        properties={items}
        type="property"
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        isAdmin={true}
      />

    {/* Stepper Form */}
{drawerItem && (
  <Dialog className="" open={!!drawerItem} onOpenChange={() => setDrawerItem(null)}>
    <DialogContent className="max-w-4xl bg-white w-full">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-center">
          {drawerItem.id ? "Edit Property" : "Create New Property"}
        </DialogTitle>
        {/* <DialogDescription>
          Fill in all steps to save the property.
        </DialogDescription> */}
      </DialogHeader>

      <PropertyStepperForm
        item={drawerItem?.id ? drawerItem : null}
        onClose={() => setDrawerItem(null)}
        onSuccess={fetchData}
      />
    </DialogContent>
  </Dialog>
)}



      {/* Confirm delete */}
      <ConfirmDeleteDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Property"
        description="Are you sure you want to delete this property?"
      />
    </div>
  );
};

export default AdminPage;
