
import { jsPDF } from "jspdf";

// Add Polish font support to PDF
export const addPolishFontSupport = async (doc: jsPDF) => {
  // Configure defaults for Polish text
  doc.setLanguage('pl');
  
  try {
    // First try to load and use Roboto font which has good support for Polish characters
    const fontData = await fetch('/fonts/Roboto-Regular.ttf').catch(() => {
      console.warn("Could not load Roboto font, falling back to built-in fonts");
      return null;
    });
    
    if (fontData && fontData.ok) {
      const fontBytes = await fontData.arrayBuffer();
      
      // Add font to virtual file system
      doc.addFileToVFS('Roboto-Regular.ttf', Buffer.from(fontBytes).toString('base64'));
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
      doc.setFont('Roboto');
      console.log("Successfully loaded Roboto font for PDF");
      return doc;
    }
  } catch (error) {
    console.warn("Error setting up custom font:", error);
  }
  
  // Fallback to using standard PDF font with decent Unicode support
  console.log("Using fallback fonts for PDF");
  doc.setFont("helvetica");
  
  return doc;
};

// Helper function to encode Polish characters for PDF
export const encodePlChars = (text: string): string => {
  if (!text || typeof text !== 'string') return String(text || '');
  
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
