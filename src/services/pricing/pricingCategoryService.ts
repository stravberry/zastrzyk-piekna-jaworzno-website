
import { supabase } from "@/integrations/supabase/client";
import { PriceCategory } from "@/components/pricing/PriceCard";
import { generateId, getPriceCategories } from "./pricingCoreService";
import { toast } from "sonner";

// Add a new category
export const addCategory = async (category: Omit<PriceCategory, "id">): Promise<PriceCategory[]> => {
  try {
    const id = generateId();
    
    const { error } = await supabase
      .from('pricing_categories')
      .insert({
        id,
        title: category.title,
        items: category.items || []
      });

    if (error) {
      console.error('Error adding category:', error);
      toast.error('Nie udało się dodać nowej kategorii.');
      throw error;
    }

    toast.success('Pomyślnie dodano nową kategorię');
    return getPriceCategories();
  } catch (error) {
    console.error('Error in addCategory:', error);
    throw error;
  }
};

// Update a category
export const updateCategory = async (
  categoryId: string, 
  updatedCategory: Partial<PriceCategory>
): Promise<PriceCategory[]> => {
  try {
    const updateData: any = {};
    
    if (updatedCategory.title) updateData.title = updatedCategory.title;
    if (updatedCategory.items) updateData.items = updatedCategory.items;
    
    const { error } = await supabase
      .from('pricing_categories')
      .update(updateData)
      .eq('id', categoryId);

    if (error) {
      console.error('Error updating category:', error);
      toast.error('Nie udało się zaktualizować kategorii.');
      throw error;
    }

    toast.success('Pomyślnie zaktualizowano kategorię');
    return getPriceCategories();
  } catch (error) {
    console.error('Error in updateCategory:', error);
    throw error;
  }
};

// Delete a category
export const deleteCategory = async (categoryId: string): Promise<PriceCategory[]> => {
  try {
    const { error } = await supabase
      .from('pricing_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('Error deleting category:', error);
      toast.error('Nie udało się usunąć kategorii.');
      throw error;
    }

    toast.success('Pomyślnie usunięto kategorię');
    return getPriceCategories();
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    throw error;
  }
};
