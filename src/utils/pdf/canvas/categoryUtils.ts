// Category handling utilities for PNG generation

import { PriceCategory } from "@/components/pricing/PriceCard";

// Split category into pages if it has too many items
export const splitCategoryIntoPages = (category: PriceCategory, maxItemsPerPage: number = 8): PriceCategory[] => {
  if (category.items.length <= maxItemsPerPage) {
    return [category];
  }

  const pages: PriceCategory[] = [];
  const totalPages = Math.ceil(category.items.length / maxItemsPerPage);

  for (let i = 0; i < totalPages; i++) {
    const startIndex = i * maxItemsPerPage;
    const endIndex = Math.min(startIndex + maxItemsPerPage, category.items.length);
    const pageItems = category.items.slice(startIndex, endIndex);

    pages.push({
      id: `${category.id}-page-${i + 1}`,
      title: `${category.title} (${i + 1}/${totalPages})`,
      items: pageItems
    });
  }

  return pages;
};