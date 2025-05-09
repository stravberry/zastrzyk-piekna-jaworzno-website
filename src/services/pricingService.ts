
import { supabase } from "@/integrations/supabase/client";
import { PriceCategory, PriceItem } from "@/components/pricing/PriceCard";
import { priceCategories as initialPriceCategories } from "@/data/pricingData";

// Get categories from Supabase or use initial data as fallback
export const getPriceCategories = async (): Promise<PriceCategory[]> => {
  const { data, error } = await supabase
    .from('pricing_categories')
    .select('*');

  if (error || !data || data.length === 0) {
    console.error('Error fetching price categories or no data:', error);
    // If we get an error or no data, use the initial data and try to save it
    await initializePriceCategories();
    return initialPriceCategories;
  }

  // Map the database format to our frontend format
  return data.map(category => ({
    id: category.id,
    title: category.title,
    items: category.items as PriceItem[]
  }));
};

// Initialize price categories with default data if table is empty
export const initializePriceCategories = async (): Promise<void> => {
  try {
    // Check if table is empty
    const { count, error: countError } = await supabase
      .from('pricing_categories')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error checking pricing_categories:', countError);
      return;
    }

    // If there are already records, don't initialize
    if (count && count > 0) return;

    // Initialize with default data
    for (const category of initialPriceCategories) {
      const { error } = await supabase
        .from('pricing_categories')
        .insert({
          id: category.id,
          title: category.title,
          items: category.items
        });
      
      if (error) {
        console.error(`Error inserting category ${category.id}:`, error);
      }
    }
  } catch (err) {
    console.error('Error initializing price categories:', err);
  }
};

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
  const updatedItems = [...(category?.items || []), item];
  
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
  const updatedItems = [...category.items];
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
  const updatedItems = [...category.items];
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

// Helper function to generate a simple ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Reset to initial data (for testing/development)
export const resetPriceCategories = async (): Promise<PriceCategory[]> => {
  try {
    // Delete all existing categories
    const { error: deleteError } = await supabase
      .from('pricing_categories')
      .delete()
      .neq('id', 'non-existent-id'); // Delete all rows
      
    if (deleteError) {
      console.error('Error deleting categories:', deleteError);
    }
    
    // Re-initialize with default data
    await initializePriceCategories();
    
    // Return the initialized data
    return getPriceCategories();
  } catch (err) {
    console.error('Error resetting price categories:', err);
    return initialPriceCategories;
  }
};

// Export pricing data as PDF
export const exportPricingToPdf = async (): Promise<Blob> => {
  // This function will be implemented with a PDF generation library
  // For now we're creating a stub that will be completed later
  const categories = await getPriceCategories();
  
  // We'll implement the actual PDF generation in a separate module
  const { generatePricingPdf } = await import('@/utils/pdfGenerator');
  return generatePricingPdf(categories);
};
