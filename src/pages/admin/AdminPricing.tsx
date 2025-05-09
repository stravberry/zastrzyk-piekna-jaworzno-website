
import React, { useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { usePricing } from "@/hooks/usePricing";
import PricingActions from "@/components/admin/pricing/PricingActions";
import PricingCategoriesList from "@/components/admin/pricing/PricingCategoriesList";
import PricingDialogs from "@/components/admin/pricing/PricingDialogs";
import { Skeleton } from "@/components/ui/skeleton";

const AdminPricing = () => {
  const {
    categories,
    isLoading,
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
    handleExportPdf
  } = usePricing();

  useEffect(() => {
    // Refresh data when component mounts to ensure we have latest data
    refreshData();
  }, []);

  return (
    <AdminLayout title="Zarządzanie cennikiem">
      <div className="p-4">
        <PricingActions 
          onAddCategory={handleAddCategory} 
          onResetData={handleResetData}
          onExportPdf={handleExportPdf}
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
        ) : (
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
        />
      </div>
    </AdminLayout>
  );
};

export default AdminPricing;
