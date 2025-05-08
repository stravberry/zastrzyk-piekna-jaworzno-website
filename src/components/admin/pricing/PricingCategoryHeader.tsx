
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PriceCategory } from "@/components/pricing/PriceCard";

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
  return (
    <div className="bg-pink-50 p-4 flex justify-between items-center">
      <h3 className="text-lg font-semibold">{category.title}</h3>
      <div className="flex space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onAddItem(category)}
        >
          <Plus className="mr-1 h-4 w-4" /> Dodaj usługę
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onEditCategory(category)}
        >
          <Pencil className="mr-1 h-4 w-4" /> Edytuj kategorię
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onDeleteCategory(category)}
        >
          <Trash2 className="mr-1 h-4 w-4" /> Usuń
        </Button>
      </div>
    </div>
  );
};

export default PricingCategoryHeader;
