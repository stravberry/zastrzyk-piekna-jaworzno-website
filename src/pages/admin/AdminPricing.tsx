
import React, { useEffect, useState } from "react";
import { usePricing } from "@/hooks/usePricing";
import PricingActions from "@/components/admin/pricing/PricingActions";
import PricingCategoriesList from "@/components/admin/pricing/PricingCategoriesList";
import PricingDialogs from "@/components/admin/pricing/PricingDialogs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

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
    handleExportPdf,
    handleExportPng
  } = usePricing();

  const [loadRetries, setLoadRetries] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Refresh data when component mounts to ensure we have latest data
    refreshData();
  }, []); // Remove refreshData dependency to prevent infinite loop

  // Function to handle exporting of full PDF without any categoryId
  const handleFullPdfExport = () => {
    handleExportPdf(); // Call without any parameters to export all categories
  };

  // Function to handle exporting of full PNG without any categoryId
  const handleFullPngExport = () => {
    handleExportPng(); // Call without any parameters to export all categories
  };

  // Functions to handle exporting single category
  const handleCategoryPdfExport = (categoryId: string) => {
    handleExportPdf(categoryId);
  };

  const handleCategoryPngExport = (categoryId: string) => {
    handleExportPng(categoryId);
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
    <div className="p-3 sm:p-4 lg:p-6 w-full min-h-screen bg-gray-50">
      <PricingActions 
        onAddCategory={handleAddCategory} 
        onResetData={handleResetData}
        onExportPdf={handleFullPdfExport}
        onExportPng={handleFullPngExport}
        isMobile={isMobile}
      />

      {isLoading ? (
        // Loading skeleton
        <div className="space-y-4 sm:space-y-8">
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
      ) : categories.length === 0 ? (
        <div className="mt-6 text-center">
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
        <PricingCategoriesList 
          categories={categories}
          onAddCategory={handleAddCategory}
          onAddItem={handleAddItem}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          onExportPdf={handleCategoryPdfExport}
          onExportPng={handleCategoryPngExport}
          isMobile={isMobile}
        />
      )}

      <PricingDialogs
        dialogType={dialogType}
        selectedCategory={selectedCategory}
        selectedItemIndex={selectedItemIndex}
        onClose={handleCloseDialog}
        onSuccess={() => refreshData(true)} // Preserve order after edits
        categories={categories}
      />
    </div>
  );
};

export default AdminPricing;
