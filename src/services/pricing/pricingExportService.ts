
import { PriceCategory } from "@/components/pricing/PriceCard";
import { getPriceCategories } from "./pricingCoreService";
import html2canvas from "html2canvas";
import { createPdfLayoutForPng } from "@/utils/pdf/pngGenerator";
import { generatePricingPdf, generatePricingPdfFromHtml } from "@/utils/pdf";
import { toast } from "sonner";

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
      throw new Error("Nie znaleziono kategorii cennika do eksportu");
    }
    
    // Logging for debugging
    console.log(`Generowanie PDF dla ${filteredCategories.length} kategorii`);
    
    try {
      // First try with the improved HTML-based PDF generator
      const pdfBlob = await generatePricingPdfFromHtml(filteredCategories);
      console.log("Pomyślnie wygenerowano PDF za pomocą metody HTML");
      return pdfBlob;
    } catch (htmlError) {
      console.error("Błąd z generatorem HTML PDF, próba metody zapasowej:", htmlError);
      
      // Add a toast to inform user about fallback method
      toast.info("Używanie alternatywnej metody generowania PDF...");
      
      // Fall back to the classic PDF generator if the HTML method fails
      try {
        const fallbackPdfBlob = await generatePricingPdf(filteredCategories);
        console.log("Pomyślnie wygenerowano PDF za pomocą metody zapasowej");
        return fallbackPdfBlob;
      } catch (fallbackError) {
        console.error("Obie metody generowania PDF zawiodły:", fallbackError);
        throw new Error("Nie udało się wygenerować PDF przy użyciu żadnej z dostępnych metod");
      }
    }
  } catch (error) {
    console.error("Błąd w exportPricingToPdf:", error);
    throw new Error("Nie udało się wygenerować PDF: " + (error as Error).message);
  }
};

// Export pricing data as PNG
export const exportPricingToPng = async (categoryId?: string): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get the categories to render
      const categories = await getPriceCategories();
      
      console.log(`Pobrano ${categories.length} kategorii z bazy danych`);
      console.log('categoryId parameter:', categoryId);
      console.log('categoryId type:', typeof categoryId);
      console.log('categoryId is undefined:', categoryId === undefined);
      console.log('categoryId is null:', categoryId === null);
      
      // Fix the filtering logic - ensure we handle undefined/null properly
      let targetCategories: PriceCategory[];
      
      if (categoryId === undefined || categoryId === null || categoryId === '') {
        // No categoryId provided - use ALL categories
        targetCategories = categories;
        console.log('Using ALL categories (no filter)');
      } else {
        // CategoryId provided - filter to specific category
        targetCategories = categories.filter(cat => cat.id === categoryId);
        console.log(`Filtering for categoryId: ${categoryId}`);
      }
      
      console.log(`Po filtrowaniu: ${targetCategories.length} kategorii do eksportu`);
      console.log('Target categories IDs:', targetCategories.map(cat => cat.id));
      
      if (targetCategories.length === 0) {
        if (categoryId) {
          throw new Error(`Nie znaleziono kategorii o ID: ${categoryId}`);
        } else {
          throw new Error("Brak dostępnych kategorii cennika do eksportu");
        }
      }
      
      // Create a temporary container for rendering
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '800px'; // Fixed width for consistent output
      document.body.appendChild(tempContainer);
      
      // Use our simplified layout without custom fonts
      tempContainer.innerHTML = createPdfLayoutForPng(targetCategories);
      
      // Even longer delay to ensure complete rendering (3 seconds)
      await new Promise(r => setTimeout(r, 3000));
      
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
          reject(new Error("Nie udało się utworzyć obrazu"));
        }
      }, 'image/png', 1.0); // Use highest quality
    } catch (error) {
      console.error("Błąd generowania PNG:", error);
      reject(error);
    }
  });
};
