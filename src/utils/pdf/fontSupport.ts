
import { jsPDF } from "jspdf";

// Add Polish font support to PDF
export const addPolishFontSupport = async (doc: jsPDF) => {
  try {
    // Configure defaults for Polish text
    doc.setLanguage('pl');
    
    // Use standard helvetica font which has better Unicode support
    doc.setFont("helvetica");
    console.log("Using built-in helvetica font for PDF");
    return doc;
  } catch (error) {
    console.warn("Error setting font:", error);
    // Fallback to default font
    return doc;
  }
};

// Improved helper function for encoding Polish characters for PDF
export const encodePlChars = (text: string): string => {
  if (!text || typeof text !== 'string') return String(text || '');
  
  // Direct Unicode mapping of Polish characters
  return text
    .replace(/ą/g, '\u0105')
    .replace(/ć/g, '\u0107')
    .replace(/ę/g, '\u0119')
    .replace(/ł/g, '\u0142')
    .replace(/ń/g, '\u0144')
    .replace(/ó/g, '\u00F3')
    .replace(/ś/g, '\u015B')
    .replace(/ź/g, '\u017A')
    .replace(/ż/g, '\u017C')
    .replace(/Ą/g, '\u0104')
    .replace(/Ć/g, '\u0106')
    .replace(/Ę/g, '\u0118')
    .replace(/Ł/g, '\u0141')
    .replace(/Ń/g, '\u0143')
    .replace(/Ó/g, '\u00D3')
    .replace(/Ś/g, '\u015A')
    .replace(/Ź/g, '\u0179')
    .replace(/Ż/g, '\u017B');
};
