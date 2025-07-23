
import { PriceCategory } from "@/components/pricing/PriceCard";
import { getPriceCategories } from "./pricingCoreService";
import html2canvas from "html2canvas";
import { createPdfLayoutForPng, createSingleCategoryLayoutForPng } from "@/utils/pdf/pngGenerator";
import { generatePricingPdf, generatePricingPdfFromHtml } from "@/utils/pdf";
import { generateFullPricingPng, generateSingleCategoryPng, generateCategoryPagesAsPng } from "@/utils/pdf/canvas";
import { getConfigByQuality } from "./pricingPngConfig";
import { toast } from "sonner";

// Improved font handling - no preloading needed with system fonts
const ensureSystemFonts = (): void => {
  // System fonts are always available, no loading required
  console.log('Używanie niezawodnych fontów systemowych');
};

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

// Helper function to download a single category as PNG with configurable quality
const downloadSingleCategoryPng = async (category: PriceCategory, quality: 'web' | 'print' | 'social' | 'instagram' = 'instagram'): Promise<void> => {
  console.log(`Rozpoczynam generowanie PNG dla kategorii: ${category.title}`);
  
  try {
    // Check if category has many items and needs to be split
    console.log('=== CATEGORY EXPORT CHECK ===');
    console.log('Category:', category.title);
    console.log('Item count:', category.items.length);
    
    // Get configuration based on quality setting
    const config = getConfigByQuality(quality);
    
    // Intelligent splitting decision based on item count
    const shouldSplit = category.items.length > 8;
    console.log(`Kategoria ${category.title} z ${category.items.length} elementami ${shouldSplit ? 'wymaga' : 'nie wymaga'} podziału`);
    
    if (shouldSplit) {
      // Use page splitting for large categories
      const blobs = await generateCategoryPagesAsPng(category, config);
      
      console.log(`Kategoria ${category.title} została podzielona na ${blobs.length} stron`);
      toast.info(`Kategoria "${category.title}" została podzielona na ${blobs.length} stron ze względu na zawartość`);
      
      const date = new Date().toISOString().slice(0, 10);
      
      // Download each page with delay to prevent browser blocking
      for (let index = 0; index < blobs.length; index++) {
        const blob = blobs[index];
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const suffix = blobs.length > 1 ? `-${index + 1}` : '';
        link.download = `Zastrzyk-Piekna-${category.title.replace(/\s+/g, '-')}${suffix}-${date}.png`;
        link.click();
        URL.revokeObjectURL(url);
        
        // Small delay between downloads to prevent browser blocking
        if (index < blobs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      console.log(`Pomyślnie pobrano ${blobs.length} plików PNG dla kategorii: ${category.title}`);
    } else {
      // Generate single PNG for smaller categories
      const blob = await generateSingleCategoryPng(category, config);
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().slice(0, 10);
      link.download = `Zastrzyk-Piekna-${category.title.replace(/\s+/g, '-')}-${date}.png`;
      link.click();
      URL.revokeObjectURL(url);
      console.log(`Pomyślnie pobrano PNG dla kategorii: ${category.title}`);
    }
  } catch (error) {
    console.error(`Błąd Canvas API dla kategorii ${category.title}, używam fallback:`, error);
    
    // Fallback to old html2canvas method
    ensureSystemFonts();
    
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '450px';
    tempContainer.style.height = '800px';
    document.body.appendChild(tempContainer);
    
    try {
      tempContainer.innerHTML = createSingleCategoryLayoutForPng(category);
      await new Promise(r => setTimeout(r, 2000));
      
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        useCORS: false,
        width: 450,
        height: 800,
      });
      
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
            console.log(`Pomyślnie pobrano PNG dla kategorii (fallback): ${category.title}`);
            resolve();
          } else {
            reject(new Error("Nie udało się utworzyć obrazu"));
          }
        }, 'image/png', 1.0);
      });
    } finally {
      document.body.removeChild(tempContainer);
    }
  }
};

// Helper function to download full pricing table as PNG with configurable quality
const downloadFullPricingTablePng = async (categories: PriceCategory[], quality: 'web' | 'print' | 'social' | 'instagram' = 'instagram'): Promise<void> => {
  console.log('Rozpoczynam generowanie PNG dla pełnego cennika');
  
  try {
    // Get configuration based on quality setting
    const config = getConfigByQuality(quality);
    
    // Use new Canvas API generator
    const blob = await generateFullPricingPng(categories, config);
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().slice(0, 10);
    link.download = `Zastrzyk-Piekna-Pelny-Cennik-${date}.png`;
    link.click();
    URL.revokeObjectURL(url);
    console.log('Pomyślnie pobrano PNG pełnego cennika');
  } catch (error) {
    console.error('Błąd Canvas API dla pełnego cennika, używam fallback:', error);
    
    // Fallback to old html2canvas method
    ensureSystemFonts();
    
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '800px';
    document.body.appendChild(tempContainer);
    
    try {
      tempContainer.innerHTML = createPdfLayoutForPng(categories);
      await new Promise(r => setTimeout(r, 2500));
      
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        useCORS: false,
      });
      
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
            console.log('Pomyślnie pobrano PNG pełnego cennika (fallback)');
            resolve();
          } else {
            reject(new Error("Nie udało się utworzyć obrazu pełnego cennika"));
          }
        }, 'image/png', 1.0);
      });
    } finally {
      document.body.removeChild(tempContainer);
    }
  }
};

// Export pricing data as PNG - updated to handle both full table and separate categories  
export const exportPricingToPng = async (categoryId?: string, quality: 'web' | 'print' | 'social' | 'instagram' = 'instagram'): Promise<Blob> => {
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
        await downloadFullPricingTablePng(categories, quality);
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
          await downloadSingleCategoryPng(category, quality);
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
      
      // Ensure system fonts are ready
      ensureSystemFonts();
      
      // Create a temporary container for rendering
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '450px'; // 9:16 aspect ratio
      tempContainer.style.height = '800px';
      document.body.appendChild(tempContainer);
      
      try {
        // Get configuration based on quality setting
        const config = getConfigByQuality(quality);
        
        // Intelligent splitting decision for single category export
        const shouldSplit = targetCategory.items.length > 8;
        
        if (shouldSplit) {
          // Use page splitting for large categories
          const blobs = await generateCategoryPagesAsPng(targetCategory, config);
          console.log(`Single category export: ${targetCategory.title} podzielone na ${blobs.length} stron`);
          toast.info(`Kategoria "${targetCategory.title}" została podzielona na ${blobs.length} stron`);
          
          // Return first blob for API compatibility
          return blobs[0];
        } else {
          // Generate single PNG for smaller categories
          const blob = await generateSingleCategoryPng(targetCategory, config);
          return blob;
        }
      } catch (error) {
        console.error('Canvas API failed, using html2canvas fallback:', error);
        
        // Fallback to html2canvas
        tempContainer.innerHTML = createSingleCategoryLayoutForPng(targetCategory);
        await new Promise(r => setTimeout(r, 2000));
        
        const canvas = await html2canvas(tempContainer, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
          allowTaint: true,
          useCORS: false,
          width: 450,
          height: 800,
        });
        
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
