
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { PriceCategory } from "@/components/pricing/PriceCard";
import {
  getPriceCategories,
  resetPriceCategories,
} from "@/services/pricingService";

export type DialogType = 'addCategory' | 'editCategory' | 'addItem' | 'editItem' | 'deleteCategory' | 'deleteItem' | null;

export const usePricing = () => {
  const [categories, setCategories] = useState<PriceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<PriceCategory | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [dialogType, setDialogType] = useState<DialogType>(null);
  
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

  return {
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
  };
};
