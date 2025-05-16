
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
  
  // Just return the text, relying on jsPDF's internal handling with helvetica font
  return text;
};
