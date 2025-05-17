import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { PriceCategory } from "@/components/pricing/PriceCard";
import {
  getPriceCategories,
  resetPriceCategories,
  exportPricingToPdf,
  exportPricingToPng
} from "@/services/pricing";

export type DialogType = 'addCategory' | 'editCategory' | 'addItem' | 'editItem' | 'deleteCategory' | 'deleteItem' | null;

export const usePricing = () => {
  const [categories, setCategories] = useState<PriceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<PriceCategory | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [dialogType, setDialogType] = useState<DialogType>(null);
  
  // Load categories
  const refreshData = useCallback(async () => {
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
  }, []);

  // Handle dialog close
  const handleCloseDialog = useCallback(() => {
    setDialogType(null);
    setSelectedCategory(null);
    setSelectedItemIndex(null);
  }, []);

  // Handle adding a new category
  const handleAddCategory = useCallback(() => {
    setDialogType('addCategory');
    setSelectedCategory(null);
  }, []);

  // Handle editing a category
  const handleEditCategory = useCallback((category: PriceCategory) => {
    setSelectedCategory(category);
    setDialogType('editCategory');
  }, []);

  // Handle deleting a category
  const handleDeleteCategory = useCallback((category: PriceCategory) => {
    setSelectedCategory(category);
    setDialogType('deleteCategory');
  }, []);

  // Handle adding an item
  const handleAddItem = useCallback((category: PriceCategory) => {
    setSelectedCategory(category);
    setDialogType('addItem');
  }, []);

  // Handle editing an item
  const handleEditItem = useCallback((category: PriceCategory, itemIndex: number) => {
    setSelectedCategory(category);
    setSelectedItemIndex(itemIndex);
    setDialogType('editItem');
  }, []);

  // Handle deleting an item
  const handleDeleteItem = useCallback((category: PriceCategory, itemIndex: number) => {
    setSelectedCategory(category);
    setSelectedItemIndex(itemIndex);
    setDialogType('deleteItem');
  }, []);

  // Handle exporting to PDF - updated with better error handling
  const handleExportPdf = useCallback(async (categoryId?: string) => {
    try {
      toast.info(categoryId 
        ? 'Generowanie PDF dla wybranej kategorii...' 
        : 'Generowanie pełnego cennika PDF...'
      );
      
      const pdfBlob = await exportPricingToPdf(categoryId);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().slice(0, 10);
      const filename = categoryId 
        ? `Zastrzyk-Piekna-Cennik-${categoryId}-${date}.pdf`
        : `Zastrzyk-Piekna-Pelny-Cennik-${date}.pdf`;
      link.download = filename;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      toast.success(categoryId 
        ? 'Pomyślnie wygenerowano PDF dla wybranej kategorii' 
        : 'Pomyślnie wygenerowano pełny cennik PDF'
      );
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error(`Nie udało się wygenerować PDF: ${(error as Error).message || 'Nieznany błąd'}`);
    }
  }, []);

  // Handle exporting to PNG
  const handleExportPng = useCallback(async (categoryId?: string) => {
    try {
      toast.info('Generowanie PNG...');
      const pngBlob = await exportPricingToPng(categoryId);
      
      // Create download link
      const url = URL.createObjectURL(pngBlob);
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().slice(0, 10);
      const filename = categoryId 
        ? `Zastrzyk-Piekna-Cennik-${categoryId}-${date}.png`
        : `Zastrzyk-Piekna-Cennik-${date}.png`;
      link.download = filename;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      toast.success('Pomyślnie wygenerowano PNG');
    } catch (error) {
      console.error('Error exporting PNG:', error);
      toast.error('Nie udało się wygenerować PNG');
    }
  }, []);

  // Handle resetting data
  const handleResetData = useCallback(async () => {
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
  }, []);

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
    handleExportPdf,
    handleExportPng
  };
};
