
import { supabase } from "@/integrations/supabase/client";
import { PriceCategory, PriceItem } from "@/components/pricing/PriceCard";
import { priceCategories as initialPriceCategories } from "@/data/pricingData";
import { toast } from "sonner";

// Get categories from Supabase or use initial data as fallback
export const getPriceCategories = async (): Promise<PriceCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('pricing_categories')
      .select('*');

    if (error) {
      console.error('Error fetching price categories:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No pricing categories found, attempting to initialize...');
      // If we get no data, use the initial data and try to save it
      return await initializePriceCategories();
    }

    // Map the database format to our frontend format
    return data.map(category => ({
      id: category.id,
      title: category.title,
      items: category.items as PriceItem[]
    }));
  } catch (err) {
    console.error('Error in getPriceCategories:', err);
    toast.error('Błąd podczas pobierania cennika. Spróbuj ponownie później.');
    return [];
  }
};

// Initialize price categories with default data if table is empty
export const initializePriceCategories = async (): Promise<PriceCategory[]> => {
  try {
    console.log('Starting price categories initialization...');
    
    // Check if table is empty
    const { count, error: countError } = await supabase
      .from('pricing_categories')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error checking pricing_categories:', countError);
      toast.error('Błąd podczas inicjalizacji cennika.');
      return [];
    }

    // If there are already records, return them instead of initializing
    if (count && count > 0) {
      console.log(`Found ${count} existing categories, skipping initialization`);
      const { data } = await supabase.from('pricing_categories').select('*');
      return (data || []).map(category => ({
        id: category.id,
        title: category.title,
        items: category.items as PriceItem[]
      }));
    }

    console.log('No categories found, initializing with default data...');

    // Initialize with default data
    const insertPromises = initialPriceCategories.map(category => 
      supabase
        .from('pricing_categories')
        .insert({
          id: category.id,
          title: category.title,
          items: category.items
        })
        .then(({ error }) => {
          if (error) {
            console.error(`Error inserting category ${category.id}:`, error);
            return { success: false, id: category.id, error };
          }
          return { success: true, id: category.id };
        })
    );
    
    const results = await Promise.all(insertPromises);
    const failedInserts = results.filter(r => !r.success);
    
    if (failedInserts.length > 0) {
      console.error('Failed to insert some categories:', failedInserts);
      toast.error(`Nie udało się dodać ${failedInserts.length} kategorii.`);
    } else {
      console.log('Successfully initialized all pricing categories');
      toast.success('Pomyślnie zainicjalizowano cennik');
    }
    
    return initialPriceCategories;
  } catch (err) {
    console.error('Error initializing price categories:', err);
    toast.error('Błąd podczas inicjalizacji cennika. Spróbuj ponownie później.');
    return initialPriceCategories; // Return initial data as fallback
  }
};

// Reset to initial data (for testing/development)
export const resetPriceCategories = async (): Promise<PriceCategory[]> => {
  try {
    console.log('Starting price categories reset...');
    
    // Delete all existing categories
    const { error: deleteError } = await supabase
      .from('pricing_categories')
      .delete()
      .neq('id', 'non-existent-id'); // Delete all rows
      
    if (deleteError) {
      console.error('Error deleting categories:', deleteError);
      toast.error('Nie udało się usunąć istniejących kategorii.');
      throw deleteError;
    }
    
    // Re-initialize with default data
    toast.info('Trwa przywracanie domyślnych danych cennika...');
    const categories = await initializePriceCategories();
    
    if (categories.length === initialPriceCategories.length) {
      toast.success('Pomyślnie zresetowano dane cennika');
    }
    
    return categories;
  } catch (err) {
    console.error('Error resetting price categories:', err);
    toast.error('Wystąpił błąd podczas resetowania cennika.');
    return [];
  }
};

// Helper function to generate a simple ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
