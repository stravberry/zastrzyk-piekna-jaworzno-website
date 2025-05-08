
import React from "react";
import { PriceCategory } from "@/components/pricing/PriceCard";
import PricingCategoryDialog from "./PricingCategoryDialog";
import PricingItemDialog from "./PricingItemDialog";
import PricingDeleteDialog from "./PricingDeleteDialog";

interface PricingDialogsProps {
  dialogType: 'addCategory' | 'editCategory' | 'addItem' | 'editItem' | 'deleteCategory' | 'deleteItem' | null;
  selectedCategory: PriceCategory | null;
  selectedItemIndex: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PricingDialogs: React.FC<PricingDialogsProps> = ({
  dialogType,
  selectedCategory,
  selectedItemIndex,
  onClose,
  onSuccess,
}) => {
  return (
    <>
      <PricingCategoryDialog
        open={dialogType === 'addCategory' || dialogType === 'editCategory'}
        onClose={onClose}
        onSuccess={onSuccess}
        category={selectedCategory}
        mode={dialogType === 'addCategory' ? 'add' : 'edit'}
      />

      <PricingItemDialog
        open={dialogType === 'addItem' || dialogType === 'editItem'}
        onClose={onClose}
        onSuccess={onSuccess}
        category={selectedCategory}
        item={selectedCategory && selectedItemIndex !== null ? selectedCategory.items[selectedItemIndex] : undefined}
        itemIndex={selectedItemIndex}
        mode={dialogType === 'addItem' ? 'add' : 'edit'}
      />

      <PricingDeleteDialog
        open={dialogType === 'deleteCategory' || dialogType === 'deleteItem'}
        onClose={onClose}
        onSuccess={onSuccess}
        category={selectedCategory}
        itemIndex={selectedItemIndex}
        type={dialogType === 'deleteCategory' ? 'category' : 'item'}
      />
    </>
  );
};

export default PricingDialogs;
