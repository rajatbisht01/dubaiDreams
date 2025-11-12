"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminDrawerForm from "@/components/admin/AdminDrawerForm";
import PropertyGrid from "@/components/property/PropertyGrid";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";

const tabs = ["property"];
const tableMap = { property: "properties", blogs: "blogs" };

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("property");
  const [items, setItems] = useState([]);
  const [drawerItem, setDrawerItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null); // Track which property to delete
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchData = async () => {
    try {
      const table = tableMap[activeTab];
      const { data, error } = await supabase.from(table).select("*").eq("deleted", false);
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error("[AdminPage] Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Opens the confirm dialog
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  // Performs actual delete
  const handleConfirmDelete = async () => {
    try {
      const res = await fetch("/api/properties/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
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
      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Add button */}
      <div className="mb-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => setDrawerItem({})}>
          Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </button>
      </div>

      {/* Property grid */}
      <PropertyGrid
        properties={items}
        type={activeTab}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        isAdmin={true}
      />

      {/* Form drawer */}
      {drawerItem && (
        <AdminDrawerForm
          tableName={tableMap[activeTab]}
          item={drawerItem?.id ? drawerItem : null}
          onClose={() => setDrawerItem(null)}
          onSubmitSuccess={fetchData}
        />
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDeleteDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Property"
        description="Are you sure you want to delete this property? This action cannot be undone."
      />
    </div>
  );
};

export default AdminPage;
