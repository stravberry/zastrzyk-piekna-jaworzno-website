
import React from "react";
import { Button } from "@/components/ui/button";
import { PriceCategory } from "@/components/pricing/PriceCard";
import { PlusCircle, Edit, Trash2, FileDown, FileImage } from "lucide-react";
import { usePricing } from "@/hooks/usePricing";

interface PricingCategoryHeaderProps {
  category: PriceCategory;
  onAddItem: (category: PriceCategory) => void;
  onEditCategory: (category: PriceCategory) => void;
  onDeleteCategory: (category: PriceCategory) => void;
}

const PricingCategoryHeader: React.FC<PricingCategoryHeaderProps> = ({
  category,
  onAddItem,
  onEditCategory,
  onDeleteCategory,
}) => {
  const { handleExportPdf, handleExportPng } = usePricing();

  return (
    <div className="bg-pink-50 p-4 flex flex-wrap justify-between items-center gap-2">
      <div className="font-semibold text-lg">{category.title}</div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExportPdf(category.id)}
        >
          <FileDown className="h-4 w-4 mr-1" />
          PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExportPng(category.id)}
        >
          <FileImage className="h-4 w-4 mr-1" />
          PNG
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          className="bg-pink-500 hover:bg-pink-600"
          onClick={() => onAddItem(category)}
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Dodaj usługę
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEditCategory(category)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700"
          onClick={() => onDeleteCategory(category)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PricingCategoryHeader;
