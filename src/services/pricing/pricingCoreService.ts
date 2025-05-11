
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

// Helper function to generate a simple ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
