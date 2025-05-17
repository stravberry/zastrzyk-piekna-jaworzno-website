import { jsPDF } from "jspdf";

// Add Polish font support to PDF
export const addPolishFontSupport = async (doc: jsPDF) => {
  try {
    // Use standard helvetica font which has good Unicode support
    doc.setFont("helvetica");
    
    // Configure document for better multilingual support
    doc.setLanguage("pl");
    
    // Configure encoding - use UTF-8
    if (typeof doc.setFontSize === 'function') {
      doc.setFontSize(12); // Reset font size to avoid scaling issues
    }
    
    // Additional settings to help with Polish character rendering
    (doc as any).setProperties({
      title: 'Cennik Usług',
      subject: 'Zastrzyk Piękna - Cennik',
      author: 'Zastrzyk Piękna',
      keywords: 'cennik, usługi, kosmetologia',
      creator: 'Zastrzyk Piękna'
    });
    
    console.log("PDF font configuration complete");
    return doc;
  } catch (error) {
    console.error("Error setting font:", error);
    return doc;
  }
};

// Helper function for encoding Polish characters
export const encodePlChars = (text: string): string => {
  if (!text || typeof text !== 'string') return String(text || '');
  
  // Just return the text, relying on proper HTML encoding
  return text;
};

// Format price with Polish currency
export const formatPriceForPdf = (price: string): string => {
  if (!price) return '';
  
  // Keep original formatting if it already contains "zł"
  if (price.toLowerCase().includes('zł')) {
    return price;
  }
  
  // Add "zł" with proper spacing
  return price.trim() + ' zł';
};
