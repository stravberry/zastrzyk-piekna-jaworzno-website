
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
    console.log("Kategorie do eksportu:", filteredCategories.map(c => c.title));
    
    try {
      // First try with the improved HTML-based PDF generator
      toast.info("Generowanie PDF z ulepszoną obsługą stron...");
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
        toast.error("Nie udało się wygenerować PDF przy użyciu żadnej z dostępnych metod");
        throw new Error("Nie udało się wygenerować PDF przy użyciu żadnej z dostępnych metod");
      }
    }
  } catch (error) {
    console.error("Błąd w exportPricingToPdf:", error);
    toast.error(`Błąd eksportu do PDF: ${(error as Error).message}`);
    throw new Error("Nie udało się wygenerować PDF: " + (error as Error).message);
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
        throw new Error("Nie znaleziono kategorii cennika do eksportu");
      }
      
      toast.info("Generowanie obrazu PNG z cennikiem...");
      
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
          toast.success("Pomyślnie wygenerowano obraz PNG");
          resolve(blob);
        } else {
          toast.error("Nie udało się utworzyć obrazu PNG");
          reject(new Error("Nie udało się utworzyć obrazu"));
        }
      }, 'image/png', 1.0); // Use highest quality
    } catch (error) {
      console.error("Błąd generowania PNG:", error);
      toast.error(`Błąd eksportu do PNG: ${(error as Error).message}`);
      reject(error);
    }
  });
};
