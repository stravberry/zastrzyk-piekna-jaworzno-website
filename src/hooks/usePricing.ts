
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PriceCategory } from "@/components/pricing/PriceCard";
import {
  getPriceCategories,
  resetPriceCategories,
  exportPricingToPdf
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
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const data = await getPriceCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
        toast.error('Nie udało się załadować cennika');
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Refresh data
  const refreshData = async () => {
    try {
      setIsLoading(true);
      const data = await getPriceCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Nie udało się odświeżyć danych');
    } finally {
      setIsLoading(false);
    }
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

  // Handle exporting to PDF
  const handleExportPdf = async () => {
    try {
      toast.info('Generowanie PDF...');
      const pdfBlob = await exportPricingToPdf();
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().slice(0, 10);
      link.download = `Zastrzyk-Piekna-Cennik-${date}.pdf`;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      toast.success('Pomyślnie wygenerowano PDF');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Nie udało się wygenerować PDF');
    }
  };

  // Handle resetting data
  const handleResetData = async () => {
    if (confirm("Czy na pewno chcesz zresetować wszystkie dane cennika do wartości początkowych?")) {
      try {
        setIsLoading(true);
        const data = await resetPriceCategories();
        setCategories(data);
        toast.success('Dane zostały zresetowane');
      } catch (error) {
        console.error('Error resetting data:', error);
        toast.error('Nie udało się zresetować danych');
      } finally {
        setIsLoading(false);
      }
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
    handleResetData,
    handleExportPdf
  };
};
