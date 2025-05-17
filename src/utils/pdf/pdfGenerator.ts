
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PriceCategory } from "@/components/pricing/PriceCard";
import { addPolishFontSupport } from "./fontSupport";
import html2canvas from "html2canvas";
import { createPdfLayoutForPng } from "./pngGenerator";

// Generate PDF for pricing data using jsPDF and autoTable
export const generatePricingPdf = async (categories: PriceCategory[]): Promise<Blob> => {
  try {
    // Create PDF with larger page format for better readability
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      putOnlyUsedFonts: true,
    });
    
    // Add support for Polish characters
    await addPolishFontSupport(doc);
    
    // Main title
    doc.setFontSize(24);
    doc.setTextColor(236, 72, 153); // Pink color for title
    doc.text("Cennik Usług", doc.internal.pageSize.width / 2, 20, { align: "center" });
    
    let yPosition = 35;
    
    // Process each category
    for (const category of categories) {
      // Add page break if needed
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Category header with background
      doc.setFillColor(236, 72, 153); // Pink background
      doc.rect(10, yPosition - 5, doc.internal.pageSize.width - 20, 10, "F");
      
      // Category title text
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255); // White text
      doc.text(category.title, 15, yPosition);
      
      yPosition += 10;
      
      // Create table for items
      autoTable(doc, {
        startY: yPosition,
        head: [["Nazwa zabiegu", "Opis", "Cena"]],
        body: category.items.map(item => [
          item.name,
          item.description || "",
          item.price
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [253, 242, 248], // Light pink
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          fontSize: 12,
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 30, halign: 'right', textColor: [236, 72, 153], fontStyle: 'bold' }
        },
        styles: {
          font: 'helvetica',
          fontSize: 10,
          cellPadding: 6,
        },
        tableWidth: 'auto',
        margin: { left: 10, right: 10 },
        didDrawPage: (data) => {
          // Add page number
          doc.setFontSize(10);
          doc.setTextColor(100);
          const pageCount = doc.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(
              `Strona ${i} z ${pageCount}`,
              doc.internal.pageSize.width - 20,
              doc.internal.pageSize.height - 10
            );
          }
        },
      });
      
      // Update position based on table height
      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }
    
    // Add footer
    const footerText = "Zastrzyk Piękna - Gabinet Kosmetologii Estetycznej";
    const dateText = `Wygenerowano ${new Date().toLocaleDateString('pl-PL')}`;
    
    // Add footer to all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(footerText, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 20, { align: "center" });
      doc.text(dateText, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 15, { align: "center" });
    }
    
    // Return as blob
    return doc.output('blob');
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

// NEW METHOD: Generate PDF from HTML for better Polish character support
export const generatePricingPdfFromHtml = async (categories: PriceCategory[]): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create HTML container in a hidden area
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '794px'; // A4 width in pixels at 96 DPI
      tempContainer.style.backgroundColor = 'white';
      document.body.appendChild(tempContainer);
      
      // Add proper meta charset
      const metaCharset = document.createElement('meta');
      metaCharset.setAttribute('charset', 'UTF-8');
      tempContainer.appendChild(metaCharset);
      
      // Generate HTML content with explicit fonts and styling for PDF conversion
      tempContainer.innerHTML += `
        <style>
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; font-family: 'Arial', sans-serif; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page { width: 794px; padding: 40px; }
          .title { color: #EC4899; text-align: center; margin-bottom: 30px; font-size: 28px; font-weight: bold; }
          .category-header { background: #EC4899; color: white; padding: 10px 15px; margin-top: 20px; font-size: 18px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
          th { background: #FDF2F8; padding: 10px 15px; text-align: left; font-weight: bold; }
          td { padding: 10px 15px; border-top: 1px solid #FCE7F3; }
          tr:nth-child(even) { background-color: #FDFAFC; }
          .price { font-weight: bold; color: #EC4899; text-align: right; }
          .description { font-style: italic; color: #666; font-size: 0.9em; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
        
        <div class="page">
          <h1 class="title">Cennik Usług</h1>
          
          ${categories.map(category => `
            <div>
              <div class="category-header">${category.title}</div>
              <table>
                <thead>
                  <tr>
                    <th style="width: 40%">Nazwa zabiegu</th>
                    <th style="width: 40%">Opis</th>
                    <th style="width: 20%; text-align: right;">Cena</th>
                  </tr>
                </thead>
                <tbody>
                  ${category.items.map(item => `
                    <tr>
                      <td>${item.name}</td>
                      <td class="description">${item.description || ''}</td>
                      <td class="price">${item.price}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `).join('')}
          
          <div class="footer">
            <p>Zastrzyk Piękna - Gabinet Kosmetologii Estetycznej</p>
            <p>Wygenerowano ${new Date().toLocaleDateString('pl-PL')}</p>
          </div>
        </div>
      `;
      
      // Allow sufficient time for fonts to load and rendering to complete
      await new Promise(r => setTimeout(r, 3000));
      
      // Use html2canvas with higher quality settings
      const canvas = await html2canvas(tempContainer, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        windowWidth: 794,
        windowHeight: tempContainer.scrollHeight,
        onclone: (document, element) => {
          // Ensure proper font rendering
          const style = document.createElement('style');
          style.textContent = `
            * { font-family: Arial, sans-serif !important; }
            .price { font-weight: bold !important; }
          `;
          document.head.appendChild(style);
          return element;
        }
      });
      
      // Create PDF from the canvas
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
        hotfixes: ["px_scaling"],
      });
      
      // Calculate dimensions
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Add image to PDF (full page)
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // If content is taller than one page, add additional pages
      let heightLeft = pdfHeight;
      let position = 0;
      
      // Remove the first page which is now redundant
      if (heightLeft > pdf.internal.pageSize.getHeight()) {
        pdf.deletePage(1);
        
        // Split the content across multiple pages
        heightLeft = pdfHeight;
        let pageHeight = pdf.internal.pageSize.getHeight();
        position = 0;
        
        while (heightLeft > 0) {
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
          position -= pageHeight;
        }
      }
      
      // Generate and return PDF blob
      const pdfBlob = pdf.output('blob');
      
      // Clean up the temporary element
      document.body.removeChild(tempContainer);
      
      resolve(pdfBlob);
    } catch (error) {
      console.error("Error generating PDF from HTML:", error);
      reject(error);
    }
  });
};

// Legacy function kept for backward compatibility
export const generatePricingPDF = async (title: string, categories: any[]) => {
  const pdfBlob = await generatePricingPdfFromHtml(categories);
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  // Create a temporary link and trigger download
  const link = document.createElement('a');
  link.href = pdfUrl;
  link.download = `cennik-${new Date().toISOString().split("T")[0]}.pdf`;
  link.click();
  
  // Clean up
  URL.revokeObjectURL(pdfUrl);
};
