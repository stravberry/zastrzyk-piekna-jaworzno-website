
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PriceCategory } from "@/components/pricing/PriceCard";

// Function to generate PDF for pricing data
export const generatePricingPDF = (title: string, categories: any[]) => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(title, 14, 22);
  doc.setFontSize(12);
  
  // Current Y position
  let yPos = 30;
  
  // For each category
  categories.forEach(category => {
    // Add category title
    doc.setFontSize(16);
    doc.text(category.title, 14, yPos);
    doc.setFontSize(12);
    yPos += 10;
    
    // Create table data
    const tableBody = category.items.map((item: any) => [
      item.name,
      item.description || "",
      `${item.price}`
    ]);
    
    // Add table
    autoTable(doc, {
      startY: yPos,
      head: [["Nazwa", "Opis", "Cena"]],
      body: tableBody,
      theme: "striped",
      headStyles: { fillColor: [243, 159, 198], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
      margin: { top: 10 },
    });
    
    // Update yPos based on where the table ends
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Add a new page if needed
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Wygenerowano ${new Date().toLocaleDateString('pl-PL')}`,
      14,
      doc.internal.pageSize.height - 10
    );
    doc.text(
      `Strona ${i} z ${pageCount}`,
      doc.internal.pageSize.width - 25,
      doc.internal.pageSize.height - 10
    );
  }
  
  // Save the PDF
  doc.save(`cennik-${new Date().toISOString().split("T")[0]}.pdf`);
};

// Function for pricing service to use
export const generatePricingPdf = (categories: PriceCategory[]): Blob => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text("Cennik Usług", 14, 22);
  doc.setFontSize(12);
  
  let yPos = 30;
  
  // For each category
  categories.forEach(category => {
    doc.setFontSize(16);
    doc.text(category.title, 14, yPos);
    doc.setFontSize(12);
    yPos += 10;
    
    const tableBody = category.items.map(item => [
      item.name,
      item.description || "",
      `${item.price}`
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [["Nazwa", "Opis", "Cena"]],
      body: tableBody,
      theme: "striped",
      headStyles: { fillColor: [243, 159, 198], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
      margin: { top: 10 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Wygenerowano ${new Date().toLocaleDateString('pl-PL')}`,
      14,
      doc.internal.pageSize.height - 10
    );
    doc.text(
      `Strona ${i} z ${pageCount}`,
      doc.internal.pageSize.width - 25,
      doc.internal.pageSize.height - 10
    );
  }
  
  // Return as Blob instead of saving directly
  return doc.output('blob');
};
