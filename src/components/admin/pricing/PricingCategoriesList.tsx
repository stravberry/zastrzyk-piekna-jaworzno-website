
import React from "react";
import { PriceCategory } from "@/components/pricing/PriceCard";
import PricingCategoryCard from "./PricingCategoryCard";
import PricingEmptyState from "./PricingEmptyState";

interface PricingCategoriesListProps {
  categories: PriceCategory[];
  onAddCategory: () => void;
  onAddItem: (category: PriceCategory) => void;
  onEditCategory: (category: PriceCategory) => void;
  onDeleteCategory: (category: PriceCategory) => void;
  onEditItem: (category: PriceCategory, itemIndex: number) => void;
  onDeleteItem: (category: PriceCategory, itemIndex: number) => void;
  onExportPdf?: (categoryId: string) => void;
  onExportPng?: (categoryId: string) => void;
  isMobile?: boolean;
}

const PricingCategoriesList: React.FC<PricingCategoriesListProps> = ({
  categories,
  onAddCategory,
  onAddItem,
  onEditCategory,
  onDeleteCategory,
  onEditItem,
  onDeleteItem,
  onExportPdf,
  onExportPng,
  isMobile = false,
}) => {
  if (categories.length === 0) {
    return <PricingEmptyState onAddCategory={onAddCategory} />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {categories.map((category) => (
        <PricingCategoryCard
          key={category.id}
          category={category}
          onAddItem={onAddItem}
          onEditCategory={onEditCategory}
          onDeleteCategory={onDeleteCategory}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
          onExportPdf={onExportPdf}
          onExportPng={onExportPng}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
};

export default PricingCategoriesList;
