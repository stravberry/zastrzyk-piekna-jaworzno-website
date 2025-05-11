
import React from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PriceCategory } from "@/components/pricing/PriceCard";
import { deleteCategory, deleteItemFromCategory } from "@/services/pricingService";
import { toast } from "sonner";

interface PricingDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: PriceCategory | null;
  itemIndex: number | null;
  type: 'category' | 'item';
}

const PricingDeleteDialog: React.FC<PricingDeleteDialogProps> = ({
  open,
  onClose,
  onSuccess,
  category,
  itemIndex,
  type,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleConfirmDelete = async () => {
    if (!category) return;
    
    try {
      setIsDeleting(true);
      
      if (type === 'category') {
        await deleteCategory(category.id);
        toast.success("Kategoria została usunięta");
      } else if (type === 'item' && typeof itemIndex === 'number') {
        await deleteItemFromCategory(category.id, itemIndex);
        toast.success("Usługa została usunięta");
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error(type === 'category' 
        ? "Nie udało się usunąć kategorii" 
        : "Nie udało się usunąć usługi"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {type === 'category' 
              ? "Czy na pewno chcesz usunąć tę kategorię?" 
              : "Czy na pewno chcesz usunąć tę usługę?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {type === 'category' 
              ? "Ta operacja usunie kategorię wraz ze wszystkimi jej usługami. Tej operacji nie można cofnąć."
              : "Ta operacja usunie wybraną usługę z cennika. Tej operacji nie można cofnąć."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Anuluj</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirmDelete();
            }}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600"
          >
            {isDeleting ? "Usuwanie..." : "Usuń"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PricingDeleteDialog;
