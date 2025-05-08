
import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { usePricing } from "@/hooks/usePricing";
import PricingActions from "@/components/admin/pricing/PricingActions";
import PricingCategoriesList from "@/components/admin/pricing/PricingCategoriesList";
import PricingDialogs from "@/components/admin/pricing/PricingDialogs";

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
    handleResetData
  } = usePricing();

  if (isLoading) {
    return (
      <AdminLayout title="Zarządzanie cennikiem">
        <div className="p-4">Ładowanie danych...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Zarządzanie cennikiem">
      <div className="p-4">
        <PricingActions 
          onAddCategory={handleAddCategory} 
          onResetData={handleResetData}
        />

        <PricingCategoriesList 
          categories={categories}
          onAddCategory={handleAddCategory}
          onAddItem={handleAddItem}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
        />

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
