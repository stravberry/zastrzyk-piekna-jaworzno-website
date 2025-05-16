
import { PriceCategory } from "@/components/pricing/PriceCard";
import { getPriceCategories } from "./pricingCoreService";
import html2canvas from "html2canvas";
import { createPdfLayoutForPng } from "@/utils/pdf/pngGenerator";
import { generatePricingPdf } from "@/utils/pdf";

// Export pricing data as PDF
export const exportPricingToPdf = async (categoryId?: string): Promise<Blob> => {
  try {
    // Get all price categories
    const categories = await getPriceCategories();
    
    // If categoryId is provided, filter to that category only
    const filteredCategories = categoryId 
      ? categories.filter(cat => cat.id === categoryId) 
      : categories;
    
    if (filteredCategories.length === 0) {
      throw new Error("No pricing categories found to export");
    }
    
    // Generate the PDF using our utility function
    return generatePricingPdf(filteredCategories);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
};

// Export pricing data as PNG
export const exportPricingToPng = async (categoryId?: string): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
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
      
      // Use our simplified layout without custom fonts
      tempContainer.innerHTML = createPdfLayoutForPng(targetCategories);
      
      // Much longer delay to ensure complete rendering (2 seconds)
      await new Promise(r => setTimeout(r, 2000));
      
      // Use html2canvas to convert to image with higher scale for better quality
      const canvas = await html2canvas(tempContainer, {
        scale: 3, // Even higher resolution for better text clarity
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        useCORS: true,
        onclone: (document, element) => {
          // Force text rendering with correct encoding in the cloned document
          const styleTag = document.createElement('style');
          styleTag.innerHTML = `* { font-family: Arial, Helvetica, sans-serif !important; }`;
          document.head.appendChild(styleTag);
          return element;
        }
      });
      
      // Convert canvas to blob with higher quality
      canvas.toBlob((blob) => {
        if (blob) {
          // Clean up temporary element
          document.body.removeChild(tempContainer);
          resolve(blob);
        } else {
          reject(new Error("Failed to create image"));
        }
      }, 'image/png', 1.0); // Use highest quality
    } catch (error) {
      console.error("Error generating PNG:", error);
      reject(error);
    }
  });
};
