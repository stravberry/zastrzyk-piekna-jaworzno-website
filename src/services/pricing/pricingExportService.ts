import { PriceCategory } from "@/components/pricing/PriceCard";
import { getPriceCategories } from "./pricingCoreService";
import html2canvas from "html2canvas";
import { createPdfLayoutForPng, createSingleCategoryLayoutForPng } from "@/utils/pdf/pngGenerator";
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

// Helper function to download a single category as PNG in 9:16 format
const downloadSingleCategoryPng = async (category: PriceCategory): Promise<void> => {
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.width = '450px'; // 9:16 aspect ratio width
  tempContainer.style.height = '800px'; // 9:16 aspect ratio height
  document.body.appendChild(tempContainer);
  
  // Use single category layout
  tempContainer.innerHTML = createSingleCategoryLayoutForPng(category);
  
  // Wait for rendering
  await new Promise(r => setTimeout(r, 2000));
  
  // Convert to canvas
  const canvas = await html2canvas(tempContainer, {
    scale: 3,
    backgroundColor: '#ffffff',
    logging: false,
    allowTaint: true,
    useCORS: true,
    width: 450,
    height: 800,
    onclone: (document, element) => {
      const styleTag = document.createElement('style');
      styleTag.innerHTML = `* { font-family: Arial, Helvetica, sans-serif !important; }`;
      document.head.appendChild(styleTag);
      return element;
    }
  });
  
  // Convert to blob and download
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const date = new Date().toISOString().slice(0, 10);
        link.download = `Zastrzyk-Piekna-${category.title.replace(/\s+/g, '-')}-${date}.png`;
        link.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(tempContainer);
        resolve();
      } else {
        reject(new Error("Nie udało się utworzyć obrazu"));
      }
    }, 'image/png', 1.0);
  });
};

// Export pricing data as PNG - updated to handle separate category downloads
export const exportPricingToPng = async (categoryId?: string): Promise<Blob> => {
  try {
    // Get the categories to render
    const categories = await getPriceCategories();
    
    console.log(`Pobrano ${categories.length} kategorii z bazy danych`);
    console.log('categoryId parameter:', categoryId);
    console.log('categoryId type:', typeof categoryId);
    console.log('categoryId is undefined:', categoryId === undefined);
    console.log('categoryId is null:', categoryId === null);
    
    // If no categoryId provided, download each category separately
    if (categoryId === undefined || categoryId === null || categoryId === '') {
      console.log('Downloading all categories as separate PNG files in 9:16 format');
      
      toast.info(`Pobieranie ${categories.length} kategorii jako oddzielne pliki PNG...`);
      
      // Download each category as separate PNG file
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        toast.info(`Generowanie PNG ${i + 1}/${categories.length}: ${category.title}`);
        await downloadSingleCategoryPng(category);
        // Small delay between downloads
        await new Promise(r => setTimeout(r, 500));
      }
      
      toast.success(`Pomyślnie pobrano ${categories.length} plików PNG`);
      
      // Return a dummy blob since we've handled the downloads separately
      return new Blob([''], { type: 'image/png' });
    } else {
      // Single category export
      const targetCategory = categories.find(cat => cat.id === categoryId);
      
      if (!targetCategory) {
        throw new Error(`Nie znaleziono kategorii o ID: ${categoryId}`);
      }
      
      console.log(`Eksport pojedynczej kategorii: ${targetCategory.title}`);
      
      // Create a temporary container for rendering
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '450px'; // 9:16 aspect ratio
      tempContainer.style.height = '800px';
      document.body.appendChild(tempContainer);
      
      // Use single category layout
      tempContainer.innerHTML = createSingleCategoryLayoutForPng(targetCategory);
      
      // Wait for rendering
      await new Promise(r => setTimeout(r, 2000));
      
      // Use html2canvas to convert to image
      const canvas = await html2canvas(tempContainer, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        useCORS: true,
        width: 450,
        height: 800,
        onclone: (document, element) => {
          const styleTag = document.createElement('style');
          styleTag.innerHTML = `* { font-family: Arial, Helvetica, sans-serif !important; }`;
          document.head.appendChild(styleTag);
          return element;
        }
      });
      
      // Convert canvas to blob
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            document.body.removeChild(tempContainer);
            resolve(blob);
          } else {
            reject(new Error("Nie udało się utworzyć obrazu"));
          }
        }, 'image/png', 1.0);
      });
    }
  } catch (error) {
    console.error("Błąd generowania PNG:", error);
    throw error;
  }
};
