
import { PriceCategory } from "@/components/pricing/PriceCard";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

export const generatePricingPdf = (categories: PriceCategory[]): Blob => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.setTextColor(219, 39, 119); // Pink color
  doc.text("Zastrzyk Piękna - Cennik", 14, 22);
  
  // Add current date
  const date = new Date().toLocaleDateString('pl-PL');
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Wygenerowano: ${date}`, 14, 30);
  
  let yPosition = 40;
  
  // For each category, add a section
  categories.forEach((category, index) => {
    // Add some space between categories
    if (index > 0) yPosition += 10;
    
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Add category title
    doc.setFontSize(16);
    doc.setTextColor(219, 39, 119);
    doc.text(category.title, 14, yPosition);
    yPosition += 10;
    
    // Prepare table data
    const tableData = category.items.map(item => {
      return [item.name, item.price, item.description || ''];
    });
    
    // Add table
    autoTable(doc, {
      startY: yPosition,
      head: [['Nazwa zabiegu', 'Cena', 'Opis']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [219, 39, 119],
        textColor: [255, 255, 255]
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 30, halign: 'right' },
        2: { cellWidth: 'auto' }
      },
      styles: {
        fontSize: 10,
        overflow: 'linebreak'
      }
    });
    
    // Update yPosition after table
    const finalY = (doc as any).lastAutoTable.finalY;
    yPosition = finalY + 10;
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Zastrzyk Piękna - Salon Kosmetologiczny w Jaworznie', 14, 285);
    doc.text(`Strona ${i} z ${pageCount}`, 180, 285);
  }
  
  // Return as blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
};
