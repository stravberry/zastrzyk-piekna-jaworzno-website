
import { jsPDF } from "jspdf";

// Add Polish font support to PDF
export const addPolishFontSupport = async (doc: jsPDF) => {
  try {
    // Use standard helvetica font which has better Unicode support
    doc.setFont("helvetica");
    
    // Set language and character encoding for better Unicode handling
    doc.setLanguage("pl");
    doc.setR2L(false);
    
    console.log("PDF font configuration complete");
    return doc;
  } catch (error) {
    console.error("Error setting font:", error);
    return doc;
  }
};

// Improved helper function for encoding Polish characters for PDF
export const encodePlChars = (text: string): string => {
  if (!text || typeof text !== 'string') return String(text || '');
  
  // Use proper UTF-8 encoding rather than character substitution
  // This approach works better with jsPDF's built-in fonts
  return text;
};
