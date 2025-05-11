
import { supabase } from "@/integrations/supabase/client";
import { PriceCategory } from "@/components/pricing/PriceCard";
import { generateId, getPriceCategories } from "./pricingCoreService";

// Add a new category
export const addCategory = async (category: Omit<PriceCategory, "id">): Promise<PriceCategory[]> => {
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
    throw error;
  }

  return getPriceCategories();
};

// Update a category
export const updateCategory = async (
  categoryId: string, 
  updatedCategory: Partial<PriceCategory>
): Promise<PriceCategory[]> => {
  const updateData: any = {};
  
  if (updatedCategory.title) updateData.title = updatedCategory.title;
  if (updatedCategory.items) updateData.items = updatedCategory.items;
  
  const { error } = await supabase
    .from('pricing_categories')
    .update(updateData)
    .eq('id', categoryId);

  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }

  return getPriceCategories();
};

// Delete a category
export const deleteCategory = async (categoryId: string): Promise<PriceCategory[]> => {
  const { error } = await supabase
    .from('pricing_categories')
    .delete()
    .eq('id', categoryId);

  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }

  return getPriceCategories();
};
