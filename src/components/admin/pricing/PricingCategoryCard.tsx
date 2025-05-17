
import React from "react";
import { PriceCategory } from "@/components/pricing/PriceCard";
import PricingCategoryHeader from "./PricingCategoryHeader";
import PricingItemsTable from "./PricingItemsTable";

interface PricingCategoryCardProps {
  category: PriceCategory;
  onAddItem: (category: PriceCategory) => void;
  onEditCategory: (category: PriceCategory) => void;
  onDeleteCategory: (category: PriceCategory) => void;
  onEditItem: (category: PriceCategory, itemIndex: number) => void;
  onDeleteItem: (category: PriceCategory, itemIndex: number) => void;
  isMobile?: boolean;
}

const PricingCategoryCard: React.FC<PricingCategoryCardProps> = ({
  category,
  onAddItem,
  onEditCategory,
  onDeleteCategory,
  onEditItem,
  onDeleteItem,
  isMobile = false,
}) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <PricingCategoryHeader
        category={category}
        onAddItem={onAddItem}
        onEditCategory={onEditCategory}
        onDeleteCategory={onDeleteCategory}
        isMobile={isMobile}
      />
      <PricingItemsTable
        category={category}
        onEditItem={onEditItem}
        onDeleteItem={onDeleteItem}
        isMobile={isMobile}
      />
    </div>
  );
};

export default PricingCategoryCard;
