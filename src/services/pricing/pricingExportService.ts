
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
    if (categoryId) {
      console.log(`Eksport pojedynczej kategorii: ${filteredCategories[0]?.title}`);
    }
    
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
  console.log(`Rozpoczynam generowanie PNG dla kategorii: ${category.title}`);
  
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.width = '450px'; // 9:16 aspect ratio width
  tempContainer.style.height = '800px'; // 9:16 aspect ratio height
  document.body.appendChild(tempContainer);
  
  try {
    // Use single category layout
    tempContainer.innerHTML = createSingleCategoryLayoutForPng(category);
    
    console.log(`Czekam na renderowanie kategorii: ${category.title}`);
    // Wait for rendering
    await new Promise(r => setTimeout(r, 1000));
    
    console.log(`Tworzę canvas dla kategorii: ${category.title}`);
    // Convert to canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
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
    
    console.log(`Konwertuję do blob kategorię: ${category.title}`);
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
          console.log(`Pomyślnie pobrano PNG dla kategorii: ${category.title}`);
          resolve();
        } else {
          console.error(`Nie udało się utworzyć blob dla kategorii: ${category.title}`);
          reject(new Error("Nie udało się utworzyć obrazu"));
        }
      }, 'image/png', 1.0);
    });
  } finally {
    document.body.removeChild(tempContainer);
  }
};

// Helper function to download full pricing table as PNG
const downloadFullPricingTablePng = async (categories: PriceCategory[]): Promise<void> => {
  console.log('Rozpoczynam generowanie PNG dla pełnego cennika');
  
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.width = '800px';
  document.body.appendChild(tempContainer);
  
  try {
    // Use full pricing layout
    tempContainer.innerHTML = createPdfLayoutForPng(categories);
    
    console.log('Czekam na renderowanie pełnego cennika');
    // Wait for rendering
    await new Promise(r => setTimeout(r, 1500));
    
    console.log('Tworzę canvas dla pełnego cennika');
    // Convert to canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      useCORS: true,
      onclone: (document, element) => {
        const styleTag = document.createElement('style');
        styleTag.innerHTML = `* { font-family: Arial, Helvetica, sans-serif !important; }`;
        document.head.appendChild(styleTag);
        return element;
      }
    });
    
    console.log('Konwertuję pełny cennik do blob');
    // Convert to blob and download
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const date = new Date().toISOString().slice(0, 10);
          link.download = `Zastrzyk-Piekna-Pelny-Cennik-${date}.png`;
          link.click();
          URL.revokeObjectURL(url);
          console.log('Pomyślnie pobrano PNG pełnego cennika');
          resolve();
        } else {
          console.error('Nie udało się utworzyć blob dla pełnego cennika');
          reject(new Error("Nie udało się utworzyć obrazu pełnego cennika"));
        }
      }, 'image/png', 1.0);
    });
  } finally {
    document.body.removeChild(tempContainer);
  }
};

// Export pricing data as PNG - updated to handle both full table and separate categories
export const exportPricingToPng = async (categoryId?: string): Promise<Blob> => {
  try {
    // Get the categories to render
    const categories = await getPriceCategories();
    
    console.log(`Pobrano ${categories.length} kategorii z bazy danych`);
    console.log('categoryId parameter:', categoryId);
    console.log('categoryId type:', typeof categoryId);
    console.log('categoryId is undefined:', categoryId === undefined);
    console.log('categoryId is null:', categoryId === null);
    
    // If no categoryId provided, download both full table and each category separately
    if (categoryId === undefined || categoryId === null || categoryId === '') {
      console.log('Downloading full pricing table and all categories as separate PNG files');
      
      toast.info(`Rozpoczynam pobieranie pełnego cennika i ${categories.length} kategorii jako oddzielne pliki PNG...`);
      
      // First download the full pricing table
      try {
        await downloadFullPricingTablePng(categories);
        console.log('Zakończono pobieranie pełnego cennika');
      } catch (error) {
        console.error('Błąd podczas pobierania pełnego cennika:', error);
        toast.error('Błąd podczas pobierania pełnego cennika');
      }
      
      // Small delay before downloading categories
      await new Promise(r => setTimeout(r, 1000));
      
      // Then download each category as separate PNG file
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        console.log(`Generowanie PNG kategorii ${i + 1}/${categories.length}: ${category.title}`);
        toast.info(`Generowanie PNG kategorii ${i + 1}/${categories.length}: ${category.title}`);
        
        try {
          await downloadSingleCategoryPng(category);
          console.log(`Zakończono pobieranie kategorii ${i + 1}/${categories.length}: ${category.title}`);
        } catch (error) {
          console.error(`Błąd podczas pobierania kategorii ${category.title}:`, error);
          toast.error(`Błąd podczas pobierania kategorii ${category.title}`);
        }
        
        // Small delay between downloads
        if (i < categories.length - 1) {
          await new Promise(r => setTimeout(r, 500));
        }
      }
      
      toast.success(`Pomyślnie pobrano pełny cennik i ${categories.length} plików PNG kategorii`);
      
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
      
      try {
        // Use single category layout
        tempContainer.innerHTML = createSingleCategoryLayoutForPng(targetCategory);
        
        // Wait for rendering
        await new Promise(r => setTimeout(r, 1000));
        
        // Use html2canvas to convert to image
        const canvas = await html2canvas(tempContainer, {
          scale: 2,
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
              resolve(blob);
            } else {
              reject(new Error("Nie udało się utworzyć obrazu"));
            }
          }, 'image/png', 1.0);
        });
      } finally {
        document.body.removeChild(tempContainer);
      }
    }
  } catch (error) {
    console.error("Błąd generowania PNG:", error);
    throw error;
  }
};
