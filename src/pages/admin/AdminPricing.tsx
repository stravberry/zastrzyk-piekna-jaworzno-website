
import React, { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { PriceCategory } from "@/components/pricing/PriceCard";
import { 
  getPriceCategories,
  resetPriceCategories
} from "@/services/pricingService";
import PricingActions from "@/components/admin/pricing/PricingActions";
import PricingCategoriesList from "@/components/admin/pricing/PricingCategoriesList";
import PricingDialogs from "@/components/admin/pricing/PricingDialogs";

const AdminPricing = () => {
  const [categories, setCategories] = useState<PriceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<PriceCategory | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [dialogType, setDialogType] = useState<'addCategory' | 'editCategory' | 'addItem' | 'editItem' | 'deleteCategory' | 'deleteItem' | null>(null);
  
  // Load categories
  useEffect(() => {
    setCategories(getPriceCategories());
    setIsLoading(false);
  }, []);

  // Refresh data
  const refreshData = () => {
    setCategories(getPriceCategories());
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogType(null);
    setSelectedCategory(null);
    setSelectedItemIndex(null);
  };

  // Handle adding a new category
  const handleAddCategory = () => {
    setDialogType('addCategory');
    setSelectedCategory(null);
  };

  // Handle editing a category
  const handleEditCategory = (category: PriceCategory) => {
    setSelectedCategory(category);
    setDialogType('editCategory');
  };

  // Handle deleting a category
  const handleDeleteCategory = (category: PriceCategory) => {
    setSelectedCategory(category);
    setDialogType('deleteCategory');
  };

  // Handle adding an item
  const handleAddItem = (category: PriceCategory) => {
    setSelectedCategory(category);
    setDialogType('addItem');
  };

  // Handle editing an item
  const handleEditItem = (category: PriceCategory, itemIndex: number) => {
    setSelectedCategory(category);
    setSelectedItemIndex(itemIndex);
    setDialogType('editItem');
  };

  // Handle deleting an item
  const handleDeleteItem = (category: PriceCategory, itemIndex: number) => {
    setSelectedCategory(category);
    setSelectedItemIndex(itemIndex);
    setDialogType('deleteItem');
  };

  // Handle resetting data
  const handleResetData = () => {
    if (confirm("Czy na pewno chcesz zresetować wszystkie dane cennika do wartości początkowych?")) {
      resetPriceCategories();
      refreshData();
      toast({
        title: "Dane zostały zresetowane",
        description: "Cennik został przywrócony do wartości początkowych"
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Zarządzanie cennikiem" subtitle="Ładowanie...">
        <div className="p-4">Ładowanie danych...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Zarządzanie cennikiem" 
      subtitle="Dodawaj, edytuj i usuwaj kategorie oraz usługi w cenniku"
    >
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
