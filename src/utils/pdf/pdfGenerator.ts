
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PriceCategory } from "@/components/pricing/PriceCard";
import { addPolishFontSupport, encodePlChars } from "./fontSupport";

// Generate PDF for pricing data
export const generatePricingPdf = async (categories: PriceCategory[]): Promise<Blob> => {
  // Create PDF with larger page format for better readability
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    putOnlyUsedFonts: true,
    floatPrecision: 16 // For better text positioning
  });
  
  // Add support for Polish characters
  await addPolishFontSupport(doc);
  
  // Set up document
  doc.setFontSize(20);
  doc.setTextColor(236, 72, 153); // Pink color for title
  
  // Add title with proper encoding
  doc.text("Cennik Usług", doc.internal.pageSize.width / 2, 20, { align: "center" });
  
  // Track current vertical position
  let yPos = 30;
  
  // For each category
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    
    // Add some spacing between categories
    if (i > 0) yPos += 5;
    
    // Check if we need to add a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Add category header with background
    doc.setFillColor(236, 72, 153); // Pink background
    doc.rect(14, yPos - 5, doc.internal.pageSize.width - 28, 10, "F");
    
    // Add category title with white text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(category.title, 16, yPos);
    
    // Reset text color for content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    yPos += 10;
    
    // Use autoTable with simplified configuration for better compatibility
    autoTable(doc, {
      startY: yPos,
      head: [["Nazwa zabiegu", "Opis", "Cena"]],
      body: category.items.map(item => [
        item.name,
        item.description ? item.description : "",
        item.price
      ]),
      theme: 'grid',
      headStyles: { 
        fillColor: [253, 242, 248], // Light pink
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 'auto', fontStyle: 'italic' },
        2: { cellWidth: 30, halign: 'right', textColor: [236, 72, 153], fontStyle: 'bold' }
      },
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 6,
        overflow: 'linebreak',
        minCellHeight: 10
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        // This helps with page numbers and footer positioning
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          doc.text(`Strona ${i} z ${pageCount}`, pageSize.width - 20, pageHeight - 10);
        }
      },
    });
    
    // Update yPos based on where the table ends
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Add basic footer with company name and date
  const footerText = "Zastrzyk Piękna - Gabinet Kosmetologii Estetycznej";
  const dateText = `Wygenerowano ${new Date().toLocaleDateString('pl-PL')}`;
  const pageCount = doc.getNumberOfPages();
  
  // Add footer to all pages
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(footerText, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 20, { align: "center" });
    doc.text(dateText, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 15, { align: "center" });
  }
  
  // Return as Blob
  return doc.output('blob');
};

// Legacy function kept for backward compatibility
export const generatePricingPDF = async (title: string, categories: any[]) => {
  const pdfBlob = await generatePricingPdf(categories);
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  // Create a temporary link and trigger download
  const link = document.createElement('a');
  link.href = pdfUrl;
  link.download = `cennik-${new Date().toISOString().split("T")[0]}.pdf`;
  link.click();
  
  // Clean up
  URL.revokeObjectURL(pdfUrl);
};
