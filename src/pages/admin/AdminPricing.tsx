
import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { usePricing } from "@/hooks/usePricing";
import PricingActions from "@/components/admin/pricing/PricingActions";
import PricingCategoriesList from "@/components/admin/pricing/PricingCategoriesList";
import PricingDialogs from "@/components/admin/pricing/PricingDialogs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const AdminPricing = () => {
  const {
    categories,
    isLoading,
    error,
    selectedCategory,
    selectedItemIndex,
    dialogType,
    refreshData,
    handleCloseDialog,
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleAddItem,
    handleEditItem,
    handleDeleteItem,
    handleResetData,
    handleExportPdf,
    handleExportPng
  } = usePricing();

  const [loadRetries, setLoadRetries] = useState(0);

  useEffect(() => {
    // Refresh data when component mounts to ensure we have latest data
    refreshData();
  }, [refreshData]);

  // Function to handle exporting of full PDF without any categoryId
  const handleFullPdfExport = () => {
    handleExportPdf(); // Call without any parameters to export all categories
  };

  const handleForceReload = () => {
    toast.info("Wymuszenie odświeżenia danych cennika...");
    setLoadRetries(prev => prev + 1);
    handleResetData().then(() => {
      toast.success("Dane cennika zostały odświeżone");
    }).catch(err => {
      toast.error("Nie udało się odświeżyć danych");
      console.error("Force reload error:", err);
    });
  };

  return (
    <AdminLayout title="Zarządzanie cennikiem">
      <div className="p-4">
        <PricingActions 
          onAddCategory={handleAddCategory} 
          onResetData={handleResetData}
          onExportPdf={handleFullPdfExport}
          onExportPng={handleExportPng}
        />

        {isLoading ? (
          // Loading skeleton
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <div className="bg-pink-50 p-4">
                  <Skeleton className="h-8 w-64" />
                </div>
                <div className="p-4">
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="mt-8 text-center p-6 border border-red-200 rounded-lg bg-red-50">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <p className="text-red-600 mb-4">
              {error}
            </p>
            <Button 
              onClick={() => refreshData()}
              variant="outline" 
              className="mx-auto mb-2"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Odśwież dane
            </Button>
            <Button 
              onClick={handleForceReload}
              variant="destructive" 
              className="mx-auto"
            >
              Wymuś reset i ponowne załadowanie danych
            </Button>
          </div>
        ) : categories.length === 0 ? (
          // Empty state (no categories)
          <div className="mt-8 text-center">
            <p className="text-gray-500 mb-4">
              Nie znaleziono kategorii cennika. Prawdopodobnie wystąpił problem z inicjalizacją danych.
            </p>
            <Button 
              onClick={handleForceReload}
              variant="default" 
              className="mx-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Wymuś ponowne załadowanie danych
            </Button>
          </div>
        ) : (
          // Render categories list if data is available
          <PricingCategoriesList 
            categories={categories}
            onAddCategory={handleAddCategory}
            onAddItem={handleAddItem}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
          />
        )}

        <PricingDialogs
          dialogType={dialogType}
          selectedCategory={selectedCategory}
          selectedItemIndex={selectedItemIndex}
          onClose={handleCloseDialog}
          onSuccess={refreshData}
          categories={categories}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminPricing;
