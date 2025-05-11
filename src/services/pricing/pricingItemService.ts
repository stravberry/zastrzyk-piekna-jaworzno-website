
import { supabase } from "@/integrations/supabase/client";
import { PriceCategory, PriceItem } from "@/components/pricing/PriceCard";
import { getPriceCategories } from "./pricingCoreService";
import { toast } from "sonner";

// Add an item to a category
export const addItemToCategory = async (
  categoryId: string, 
  item: PriceItem
): Promise<PriceCategory[]> => {
  try {
    // First we need to get the current items
    const { data: category, error: fetchError } = await supabase
      .from('pricing_categories')
      .select('items')
      .eq('id', categoryId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching category items:', fetchError);
      toast.error('Nie udało się pobrać listy usług.');
      throw fetchError;
    }
    
    if (!category) {
      const notFoundError = new Error(`Category with ID ${categoryId} not found`);
      console.error(notFoundError);
      toast.error('Nie znaleziono wybranej kategorii.');
      throw notFoundError;
    }
    
    // Add the new item to the array
    const updatedItems = [...(category?.items as PriceItem[] || []), item];
    
    // Update the category
    const { error: updateError } = await supabase
      .from('pricing_categories')
      .update({ items: updatedItems })
      .eq('id', categoryId);
      
    if (updateError) {
      console.error('Error adding item to category:', updateError);
      toast.error('Nie udało się dodać usługi do kategorii.');
      throw updateError;
    }
    
    toast.success('Pomyślnie dodano usługę');
    return getPriceCategories();
  } catch (error) {
    console.error('Error in addItemToCategory:', error);
    throw error;
  }
};

// Update an item in a category
export const updateItemInCategory = async (
  categoryId: string, 
  itemIndex: number, 
  updatedItem: Partial<PriceItem>
): Promise<PriceCategory[]> => {
  try {
    // First we need to get the current items
    const { data: category, error: fetchError } = await supabase
      .from('pricing_categories')
      .select('items')
      .eq('id', categoryId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching category items:', fetchError);
      toast.error('Nie udało się pobrać listy usług.');
      throw fetchError;
    }
    
    if (!category || !category.items) {
      const notFoundError = new Error('Category or items not found');
      console.error(notFoundError);
      toast.error('Nie znaleziono kategorii lub listy usług.');
      throw notFoundError;
    }
    
    // Update the specific item
    const updatedItems = [...(category.items as PriceItem[])];
    
    if (itemIndex < 0 || itemIndex >= updatedItems.length) {
      const indexError = new Error(`Item index ${itemIndex} out of range`);
      console.error(indexError);
      toast.error('Nieprawidłowy indeks usługi.');
      throw indexError;
    }
    
    updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...updatedItem };
    
    // Update the category
    const { error: updateError } = await supabase
      .from('pricing_categories')
      .update({ items: updatedItems })
      .eq('id', categoryId);
      
    if (updateError) {
      console.error('Error updating item in category:', updateError);
      toast.error('Nie udało się zaktualizować usługi.');
      throw updateError;
    }
    
    toast.success('Pomyślnie zaktualizowano usługę');
    return getPriceCategories();
  } catch (error) {
    console.error('Error in updateItemInCategory:', error);
    throw error;
  }
};

// Delete an item from a category
export const deleteItemFromCategory = async (
  categoryId: string, 
  itemIndex: number
): Promise<PriceCategory[]> => {
  try {
    // First we need to get the current items
    const { data: category, error: fetchError } = await supabase
      .from('pricing_categories')
      .select('items')
      .eq('id', categoryId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching category items:', fetchError);
      toast.error('Nie udało się pobrać listy usług.');
      throw fetchError;
    }
    
    if (!category || !category.items) {
      const notFoundError = new Error('Category or items not found');
      console.error(notFoundError);
      toast.error('Nie znaleziono kategorii lub listy usług.');
      throw notFoundError;
    }
    
    // Remove the specific item
    const updatedItems = [...(category.items as PriceItem[])];
    
    if (itemIndex < 0 || itemIndex >= updatedItems.length) {
      const indexError = new Error(`Item index ${itemIndex} out of range`);
      console.error(indexError);
      toast.error('Nieprawidłowy indeks usługi.');
      throw indexError;
    }
    
    updatedItems.splice(itemIndex, 1);
    
    // Update the category
    const { error: updateError } = await supabase
      .from('pricing_categories')
      .update({ items: updatedItems })
      .eq('id', categoryId);
      
    if (updateError) {
      console.error('Error deleting item from category:', updateError);
      toast.error('Nie udało się usunąć usługi.');
      throw updateError;
    }
    
    toast.success('Pomyślnie usunięto usługę');
    return getPriceCategories();
  } catch (error) {
    console.error('Error in deleteItemFromCategory:', error);
    throw error;
  }
};
