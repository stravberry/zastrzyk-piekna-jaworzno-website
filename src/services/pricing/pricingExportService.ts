
import { PriceCategory } from "@/components/pricing/PriceCard";
import { getPriceCategories } from "./pricingCoreService";
import html2canvas from "html2canvas";
import { createPdfLayoutForPng } from "@/utils/pdfGenerator";

// Export pricing data as PDF
export const exportPricingToPdf = async (categoryId?: string): Promise<Blob> => {
  // This function will be implemented with a PDF generation library
  const categories = await getPriceCategories();
  
  // If categoryId is provided, filter to that category only
  const filteredCategories = categoryId 
    ? categories.filter(cat => cat.id === categoryId) 
    : categories;
  
  // We'll implement the actual PDF generation in a separate module
  const { generatePricingPdf } = await import('@/utils/pdfGenerator');
  return generatePricingPdf(filteredCategories);
};

// Export pricing data as PNG
export const exportPricingToPng = async (categoryId?: string): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Wait for next render cycle to ensure DOM is updated
      setTimeout(async () => {
        // Get the categories to render
        const categories = await getPriceCategories();
        
        // Filter categories if categoryId is provided
        const targetCategories = categoryId
          ? categories.filter(cat => cat.id === categoryId)
          : categories;
        
        if (targetCategories.length === 0) {
          throw new Error("No pricing categories found to export");
        }
        
        // Create a temporary container for rendering
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.width = '800px'; // Fixed width for consistent output
        document.body.appendChild(tempContainer);
        
        // Use our improved layout for better visual consistency
        tempContainer.innerHTML = createPdfLayoutForPng(targetCategories);
        
        // Załaduj czcionki przed renderowaniem
        await document.fonts.ready;
        
        // Use html2canvas to convert to image
        const canvas = await html2canvas(tempContainer, {
          scale: 2, // Higher resolution
          backgroundColor: '#ffffff',
          logging: false,
          allowTaint: true,
          useCORS: true,
        });
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Clean up temporary element
            document.body.removeChild(tempContainer);
            resolve(blob);
          } else {
            reject(new Error("Failed to create image"));
          }
        }, 'image/png', 0.95);
      }, 100);
    } catch (error) {
      console.error("Error generating PNG:", error);
      reject(error);
    }
  });
};
