// Category handling utilities for PNG generation

import { PriceCategory } from "@/components/pricing/PriceCard";

// Legacy function - kept for compatibility
// The improved generator handles splitting automatically based on content height
export const splitCategoryIntoPages = (category: PriceCategory, maxItemsPerPage: number = 6): PriceCategory[] => {
  console.log('=== LEGACY CATEGORY SPLITTING (fallback) ===');
  console.log('Category name:', category.title);
  console.log('Total items:', category.items.length);
  console.log('Max items per page:', maxItemsPerPage);
  
  if (category.items.length <= maxItemsPerPage) {
    console.log('Category fits in single page, no splitting needed');
    console.log('===========================');
    return [category];
  }

  const pages: PriceCategory[] = [];
  const totalPages = Math.ceil(category.items.length / maxItemsPerPage);
  
  console.log('Will split into', totalPages, 'pages');

  for (let i = 0; i < totalPages; i++) {
    const startIndex = i * maxItemsPerPage;
    const endIndex = Math.min(startIndex + maxItemsPerPage, category.items.length);
    const pageItems = category.items.slice(startIndex, endIndex);
    
    console.log(`Page ${i + 1}: items ${startIndex} to ${endIndex - 1} (${pageItems.length} items)`);

    pages.push({
      id: `${category.id}-page-${i + 1}`,
      title: `${category.title} (${i + 1}/${totalPages})`,
      items: pageItems
    });
  }
  
  console.log('Final pages created:', pages.length);
  console.log('===========================');

  return pages;
};