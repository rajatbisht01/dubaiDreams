"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Plus, 
  Building2, 
  MapPin, 
  Users, 
  Tag, 
  Sparkles, 
  Eye, 
  FileText,
  Home,
  Settings,
  ShieldCheck
} from "lucide-react";

import PropertyStepperForm from "@/components/admin/PropertyStepperForm";
import PropertyGrid from "@/components/property/PropertyGrid";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import LookupManager from "@/components/admin/LookupManager";
import UserManager from "@/components/admin/UserManager";
import { useUser } from "@/hooks/useUser";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("properties");
  const { profile, loading } = useUser();
  // Properties state
  const [properties, setProperties] = useState([]);
  const [drawerItem, setDrawerItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalUsers: 0,
    totalDevelopers: 0,
    totalCommunities: 0
  });

  // Load properties
  const fetchProperties = async () => {
    try {
      const res = await fetch("/api/admin/properties");
      const data = await res.json();
      console.log("fetch properties",data)
      if (!Array.isArray(data)) throw new Error("Invalid data");
      setProperties(data);
      setStats(prev => ({ ...prev, totalProperties: data.length }));
    } catch (err) {
      console.error("[AdminPage] fetchProperties error:", err);
    }
  };

  // Load stats
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("[AdminPage] fetchStats error:", err);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchStats();
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
      fetchProperties();
      fetchStats();
    } catch (err) {
      console.error("Delete failed:", err);
      setShowConfirm(false);
    }
  };

  const handleEdit = (item) => setDrawerItem(item);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-center">Admin Dashboard</h1>
          <h1 className="text-4xl font-bold mb-2">Hi {profile?.full_name}</h1>

          <p className="text-muted-foreground">
            Manage properties, lookups, and users
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Properties
              </CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProperties}</div>
              <p className="text-xs text-muted-foreground">
                Active listings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Developers
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDevelopers}</div>
              <p className="text-xs text-muted-foreground">
                Active developers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Communities
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCommunities}</div>
              <p className="text-xs text-muted-foreground">
                Listed areas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 mb-8">
            <TabsTrigger value="properties" className="gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Properties</span>
            </TabsTrigger>
            <TabsTrigger value="types" className="gap-2">
              <Tag className="h-4 w-4" />
              <span className="hidden sm:inline">Types</span>
            </TabsTrigger>
            <TabsTrigger value="status" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Status</span>
            </TabsTrigger>
            <TabsTrigger value="communities" className="gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Communities</span>
            </TabsTrigger>
            <TabsTrigger value="developers" className="gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Developers</span>
            </TabsTrigger>
            <TabsTrigger value="amenities" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Amenities</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Features</span>
            </TabsTrigger>
            <TabsTrigger value="views" className="gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Views</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
          </TabsList>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Properties Management</h2>
                <p className="text-muted-foreground">
                  Add, edit, or remove properties
                </p>
              </div>
              <Button onClick={() => setDrawerItem({})}>
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </div>
            <PropertyGrid
              properties={properties}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          </TabsContent>

          {/* Property Types Tab */}
          <TabsContent value="types">
            <LookupManager
              title="Property Types"
              description="Manage property types (Apartment, Villa, Townhouse, etc.)"
              endpoint="property-types"
              icon={<Tag className="h-5 w-5" />}
              onUpdate={fetchStats}
            />
          </TabsContent>

          {/* Status Tab */}
          <TabsContent value="status">
            <LookupManager
              title="Property Status"
              description="Manage property status (Off-Plan, Ready, Under Construction, etc.)"
              endpoint="property-status"
              icon={<Sparkles className="h-5 w-5" />}
              onUpdate={fetchStats}
            />
          </TabsContent>

          {/* Communities Tab */}
          <TabsContent value="communities">
            <LookupManager
              title="Communities"
              description="Manage communities and locations"
              endpoint="communities"
              icon={<MapPin className="h-5 w-5" />}
              onUpdate={fetchStats}
            />
          </TabsContent>

          {/* Developers Tab */}
          <TabsContent value="developers">
            <LookupManager
              title="Developers"
              description="Manage property developers"
              endpoint="developers"
              icon={<Building2 className="h-5 w-5" />}
              hasLogo={true}
              onUpdate={fetchStats}
            />
          </TabsContent>

          {/* Amenities Tab */}
          <TabsContent value="amenities">
            <LookupManager
              title="Amenities"
              description="Manage property amenities (Pool, Gym, Parking, etc.)"
              endpoint="amenities"
              icon={<Settings className="h-5 w-5" />}
              onUpdate={fetchStats}
            />
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features">
            <LookupManager
              title="Property Features"
              description="Manage property features"
              endpoint="features"
              icon={<Sparkles className="h-5 w-5" />}
              onUpdate={fetchStats}
            />
          </TabsContent>

          {/* Views Tab */}
          <TabsContent value="views">
            <LookupManager
              title="View Types"
              description="Manage view types (Sea View, Garden View, etc.)"
              endpoint="view-types"
              icon={<Eye className="h-5 w-5" />}
              onUpdate={fetchStats}
            />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <UserManager onUpdate={fetchStats} />
          </TabsContent>
        </Tabs>

        {/* Property Stepper Form Dialog */}
        {drawerItem && (
          <Dialog open={!!drawerItem} onOpenChange={() => setDrawerItem(null)}>
            <DialogContent className="max-w-4xl text-center p-2 max-h-[100vh] overflow-y-auto">
              <DialogHeader >
                <DialogTitle className={'text-center'} >
                  {drawerItem.id ? "Edit Property" : "Create New Property"}
                </DialogTitle>
                <DialogDescription className={'text-center'}>
                  Fill in all steps to save the property
                </DialogDescription>
              </DialogHeader>
              <PropertyStepperForm
                item={drawerItem}
                onClose={() => setDrawerItem(null)}
                onSuccess={() => {
                  fetchProperties();
                  fetchStats();
                }}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Confirm Delete Dialog */}
        <ConfirmDeleteDialog
          open={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Property"
          description="Are you sure you want to delete this property? This action cannot be undone."
        />
      </div>
     


     
    </div>
  );
};

export default AdminPage;