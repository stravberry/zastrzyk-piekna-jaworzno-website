
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PriceCategory } from "@/components/pricing/PriceCard";
import { deleteCategory, deleteItemFromCategory } from "@/services/pricingService";
import { toast } from "@/hooks/use-toast";

type PricingDeleteDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: PriceCategory | null;
  itemIndex: number | null;
  type: "category" | "item";
};

const PricingDeleteDialog: React.FC<PricingDeleteDialogProps> = ({
  open,
  onClose,
  onSuccess,
  category,
  itemIndex,
  type,
}) => {
  const handleDelete = () => {
    try {
      if (!category) return;

      if (type === "category") {
        // Delete category
        deleteCategory(category.id);
        toast({
          title: "Kategoria usunięta",
          description: `Kategoria "${category.title}" została usunięta.`,
        });
      } else {
        // Delete item
        if (itemIndex !== null) {
          const itemName = category.items[itemIndex].name;
          deleteItemFromCategory(category.id, itemIndex);
          toast({
            title: "Zabieg usunięty",
            description: `Zabieg "${itemName}" został usunięty.`,
          });
        }
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error deleting:", error);
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas usuwania.",
        variant: "destructive",
      });
    }
  };

  const getDialogTitle = () => {
    if (type === "category") {
      return "Usuń kategorię";
    }
    return "Usuń zabieg";
  };

  const getDialogDescription = () => {
    if (!category) return "";

    if (type === "category") {
      return `Czy na pewno chcesz usunąć kategorię "${category.title}"? Wszystkie zabiegi w tej kategorii również zostaną usunięte. Tej operacji nie można cofnąć.`;
    }

    if (itemIndex !== null && category.items[itemIndex]) {
      return `Czy na pewno chcesz usunąć zabieg "${category.items[itemIndex].name}"? Tej operacji nie można cofnąć.`;
    }

    return "";
  };

  return (
    <AlertDialog open={open} onOpenChange={() => onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getDialogTitle()}</AlertDialogTitle>
          <AlertDialogDescription>
            {getDialogDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Anuluj</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Usuń
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PricingDeleteDialog;
