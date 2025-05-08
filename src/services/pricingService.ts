
import { PriceCategory, PriceItem } from "@/components/pricing/PriceCard";
import { priceCategories as initialPriceCategories } from "@/data/pricingData";

// In a real application, this would interact with a backend API
// For now we'll store the data in localStorage

const PRICING_STORAGE_KEY = "clinic_pricing_data";

// Get categories from localStorage or use initial data
export const getPriceCategories = (): PriceCategory[] => {
  const storedData = localStorage.getItem(PRICING_STORAGE_KEY);
  if (storedData) {
    try {
      return JSON.parse(storedData);
    } catch (e) {
      console.error("Error parsing pricing data from localStorage:", e);
      return initialPriceCategories;
    }
  }
  return initialPriceCategories;
};

// Save categories to localStorage
export const savePriceCategories = (categories: PriceCategory[]): void => {
  localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(categories));
};

// Add a new category
export const addCategory = (category: Omit<PriceCategory, "id">): PriceCategory[] => {
  const categories = getPriceCategories();
  const newCategory = {
    ...category,
    id: generateId(),
    items: category.items || []
  };
  const updatedCategories = [...categories, newCategory];
  savePriceCategories(updatedCategories);
  return updatedCategories;
};

// Update a category
export const updateCategory = (categoryId: string, updatedCategory: Partial<PriceCategory>): PriceCategory[] => {
  const categories = getPriceCategories();
  const updatedCategories = categories.map(category => 
    category.id === categoryId 
      ? { ...category, ...updatedCategory } 
      : category
  );
  savePriceCategories(updatedCategories);
  return updatedCategories;
};

// Delete a category
export const deleteCategory = (categoryId: string): PriceCategory[] => {
  const categories = getPriceCategories();
  const updatedCategories = categories.filter(category => category.id !== categoryId);
  savePriceCategories(updatedCategories);
  return updatedCategories;
};

// Add an item to a category
export const addItemToCategory = (categoryId: string, item: PriceItem): PriceCategory[] => {
  const categories = getPriceCategories();
  const updatedCategories = categories.map(category => {
    if (category.id === categoryId) {
      return {
        ...category,
        items: [...category.items, item]
      };
    }
    return category;
  });
  savePriceCategories(updatedCategories);
  return updatedCategories;
};

// Update an item in a category
export const updateItemInCategory = (
  categoryId: string, 
  itemIndex: number, 
  updatedItem: Partial<PriceItem>
): PriceCategory[] => {
  const categories = getPriceCategories();
  const updatedCategories = categories.map(category => {
    if (category.id === categoryId) {
      const updatedItems = [...category.items];
      updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...updatedItem };
      return {
        ...category,
        items: updatedItems
      };
    }
    return category;
  });
  savePriceCategories(updatedCategories);
  return updatedCategories;
};

// Delete an item from a category
export const deleteItemFromCategory = (categoryId: string, itemIndex: number): PriceCategory[] => {
  const categories = getPriceCategories();
  const updatedCategories = categories.map(category => {
    if (category.id === categoryId) {
      const updatedItems = [...category.items];
      updatedItems.splice(itemIndex, 1);
      return {
        ...category,
        items: updatedItems
      };
    }
    return category;
  });
  savePriceCategories(updatedCategories);
  return updatedCategories;
};

// Helper function to generate a simple ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Reset to initial data (for testing/development)
export const resetPriceCategories = (): PriceCategory[] => {
  savePriceCategories(initialPriceCategories);
  return initialPriceCategories;
};
