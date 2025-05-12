
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
  
  // Add title with proper encoding
  doc.setFontSize(24);
  doc.setTextColor(236, 72, 153); // Pink color for title
  const title = encodePlChars("Cennik Usług");
  doc.text(title, doc.internal.pageSize.width / 2, 20, { align: "center" });
  
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
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    yPos += 10;
    
    // Use autoTable for better layout control with customized styling to match PNG
    const tableBody = category.items.map(item => [
      encodePlChars(item.name),
      item.description ? encodePlChars(item.description) : "",
      encodePlChars(item.price)
    ]);
    
    // Calculate dynamic column widths based on content
    const nameColWidth = Math.max(...category.items.map(i => i.name.length * 1.8));
    const priceColWidth = Math.max(...category.items.map(i => i.price.length * 2.5));
    const descColWidth = doc.internal.pageSize.width - 28 - nameColWidth - priceColWidth;
    
    autoTable(doc, {
      startY: yPos,
      head: [["Nazwa zabiegu", "Opis", "Cena"]],
      body: tableBody,
      theme: "grid",
      headStyles: { 
        fillColor: [253, 242, 248], // Light pink for header (tailwind pink-50)
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'left'
      },
      alternateRowStyles: {
        fillColor: [252, 231, 243], // Lighter pink for alternating rows
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: nameColWidth },
        1: { cellWidth: descColWidth },
        2: { halign: 'right', fontStyle: 'bold', textColor: [236, 72, 153], cellWidth: priceColWidth }
      },
      styles: { 
        fontSize: 10,
        cellPadding: 4,
        lineColor: [236, 72, 153],
        lineWidth: 0.1,
        font: doc.getFont().fontName
      },
      margin: { top: 10, left: 14, right: 14 },
      showHead: "firstPage",
    });
    
    // Update yPos based on where the table ends
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Add footer with company name and date
  const footerText = encodePlChars(`Zastrzyk Piękna - Gabinet Kosmetologii Estetycznej`);
  const dateText = encodePlChars(`Wygenerowano ${new Date().toLocaleDateString('pl-PL')}`);
  
  // Add footer to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(footerText, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 15, { align: "center" });
    doc.text(dateText, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: "center" });
    doc.text(`Strona ${i} z ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 5);
  }
  
  // Return as Blob instead of direct saving
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
