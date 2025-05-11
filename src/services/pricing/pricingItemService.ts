
import { supabase } from "@/integrations/supabase/client";
import { PriceCategory, PriceItem } from "@/components/pricing/PriceCard";
import { getPriceCategories } from "./pricingCoreService";

// Add an item to a category
export const addItemToCategory = async (
  categoryId: string, 
  item: PriceItem
): Promise<PriceCategory[]> => {
  // First we need to get the current items
  const { data: category, error: fetchError } = await supabase
    .from('pricing_categories')
    .select('items')
    .eq('id', categoryId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching category items:', fetchError);
    throw fetchError;
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
    throw updateError;
  }
  
  return getPriceCategories();
};

// Update an item in a category
export const updateItemInCategory = async (
  categoryId: string, 
  itemIndex: number, 
  updatedItem: Partial<PriceItem>
): Promise<PriceCategory[]> => {
  // First we need to get the current items
  const { data: category, error: fetchError } = await supabase
    .from('pricing_categories')
    .select('items')
    .eq('id', categoryId)
    .single();
    
  if (fetchError) {
    console.error('Error fetching category items:', fetchError);
    throw fetchError;
  }
  
  if (!category || !category.items) {
    console.error('Category or items not found');
    throw new Error('Category or items not found');
  }
  
  // Update the specific item
  const updatedItems = [...(category.items as PriceItem[])];
  updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...updatedItem };
  
  // Update the category
  const { error: updateError } = await supabase
    .from('pricing_categories')
    .update({ items: updatedItems })
    .eq('id', categoryId);
    
  if (updateError) {
    console.error('Error updating item in category:', updateError);
    throw updateError;
  }
  
  return getPriceCategories();
};

// Delete an item from a category
export const deleteItemFromCategory = async (
  categoryId: string, 
  itemIndex: number
): Promise<PriceCategory[]> => {
  // First we need to get the current items
  const { data: category, error: fetchError } = await supabase
    .from('pricing_categories')
    .select('items')
    .eq('id', categoryId)
    .single();
    
  if (fetchError) {
    console.error('Error fetching category items:', fetchError);
    throw fetchError;
  }
  
  if (!category || !category.items) {
    console.error('Category or items not found');
    throw new Error('Category or items not found');
  }
  
  // Remove the specific item
  const updatedItems = [...(category.items as PriceItem[])];
  updatedItems.splice(itemIndex, 1);
  
  // Update the category
  const { error: updateError } = await supabase
    .from('pricing_categories')
    .update({ items: updatedItems })
    .eq('id', categoryId);
    
  if (updateError) {
    console.error('Error deleting item from category:', updateError);
    throw updateError;
  }
  
  return getPriceCategories();
};
