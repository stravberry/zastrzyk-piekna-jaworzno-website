
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
    format: "a4"
  });
  
  // Add support for Polish characters
  await addPolishFontSupport(doc);
  
  // Set up document
  doc.setFontSize(20);
  doc.setTextColor(236, 72, 153); // Pink color for title
  
  // Add title with proper encoding
  const title = encodePlChars("Cennik Usług");
  doc.text(title, doc.internal.pageSize.width / 2, 20, { align: "center" });
  
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
    const categoryTitle = encodePlChars(category.title);
    doc.text(categoryTitle, 16, yPos);
    
    // Reset text color for content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    yPos += 10;
    
    // Prepare simplified table structure to avoid layout issues
    const tableHead = [
      [encodePlChars("Nazwa zabiegu"), encodePlChars("Opis"), encodePlChars("Cena")]
    ];
    
    // Prepare table data with proper encoding
    const tableBody = [];
    for (const item of category.items) {
      tableBody.push([
        encodePlChars(item.name),
        item.description ? encodePlChars(item.description) : "",
        encodePlChars(item.price)
      ]);
    }
    
    // Use autoTable with simplified configuration to avoid layout issues
    autoTable(doc, {
      startY: yPos,
      head: tableHead,
      body: tableBody,
      theme: 'grid',
      headStyles: { 
        fillColor: [253, 242, 248], // Light pink
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'left'
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
        overflow: 'linebreak',
        font: 'helvetica'
      },
      columnStyles: {
        0: { fontStyle: 'normal', cellWidth: 60 },
        1: { fontStyle: 'italic', cellWidth: 'auto' },
        2: { halign: 'right', fontStyle: 'bold', textColor: [236, 72, 153], cellWidth: 25 }
      },
      margin: { left: 14, right: 14 },
    });
    
    // Update yPos based on where the table ends
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Add basic footer with company name and date
  const footerText = encodePlChars("Zastrzyk Piękna - Gabinet Kosmetologii Estetycznej");
  const dateText = encodePlChars(`Wygenerowano ${new Date().toLocaleDateString('pl-PL')}`);
  const pageCount = doc.getNumberOfPages();
  
  // Add footer to all pages
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(footerText, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 15, { align: "center" });
    doc.text(dateText, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: "center" });
    
    // Add page numbers
    const pageText = encodePlChars(`Strona ${i} z ${pageCount}`);
    doc.text(pageText, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 5);
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
