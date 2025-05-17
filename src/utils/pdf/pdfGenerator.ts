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
    
    // Main title page
    doc.setFontSize(24);
    doc.setTextColor(236, 72, 153); // Pink color for title
    doc.text("Cennik Usług", doc.internal.pageSize.width / 2, 20, { align: "center" });
    
    // Process each category on a separate page
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      
      // Always add new page for each category after the first page
      if (i > 0) {
        doc.addPage();
      }
      
      // Reset position for new page
      let yPosition = 40; // Start slightly lower on category pages
      
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
          overflow: 'linebreak',
        },
        tableWidth: 'auto',
        margin: { left: 10, right: 10 },
        // Keep table rows together on same page when possible
        rowPageBreak: 'avoid',
        // Avoid breaking inside rows (important for descriptions)
        bodyStyles: { minCellHeight: 20 },
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
            
            // Add footer to every page
            const footerText = "Zastrzyk Piękna - Gabinet Kosmetologii Estetycznej";
            const dateText = `Wygenerowano ${new Date().toLocaleDateString('pl-PL')}`;
            doc.text(footerText, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 20, { align: "center" });
            doc.text(dateText, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 15, { align: "center" });
          }
        },
      });
    }
    
    // Return as blob
    return doc.output('blob');
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

// Improved HTML-to-PDF generator with better page breaking
export const generatePricingPdfFromHtml = async (categories: PriceCategory[]): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Format price with proper Polish currency symbol
      const formatPrice = (price: string): string => {
        // Keep original formatting if it already contains "zł" 
        if (price.toLowerCase().includes('zł')) {
          return price;
        }
        // Otherwise add "zł" with proper spacing
        return price.trim() + ' zł';
      };
      
      // Create HTML container in a hidden area
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '794px'; // A4 width in pixels at 96 DPI
      tempContainer.style.backgroundColor = 'white';
      document.body.appendChild(tempContainer);
      
      // Generate HTML content using the same styling as PNG generator
      tempContainer.innerHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @charset "UTF-8";
            @page { size: A4; margin: 20mm 15mm; }
            body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif !important; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            
            /* Use the exact same styles as in createPdfLayoutForPng */
            .title { color: #EC4899; text-align: center; font-size: 28px; font-weight: bold; margin-bottom: 30px; }
            .category-header { background: #EC4899; color: white; padding: 10px 12px; margin-top: 20px; font-size: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; table-layout: fixed; }
            th { background: #FDF2F8; padding: 12px; text-align: left; font-weight: bold; font-size: 16px; }
            td { padding: 12px; border-top: 1px solid #FCE7F3; word-break: break-word; font-size: 14px; }
            tr:nth-child(even) { background-color: #FCF2F8; }
            .price { font-weight: bold; color: #EC4899; text-align: right; }
            .description { font-style: italic; color: #666; font-size: 0.9em; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            
            /* Page break rules */
            .page-container { page-break-after: always; min-height: 100vh; position: relative; padding: 40px 20px 60px 20px; }
            .page-container:last-child { page-break-after: auto; }
            .category { page-break-inside: avoid; }
            tr { page-break-inside: avoid; }
            
            @media print {
              .page-container { page-break-after: always; }
            }
          </style>
        </head>
        <body>
          <!-- Title page -->
          <div class="page-container">
            <h1 class="title">Cennik Usług</h1>
            <p style="text-align: center; font-size: 16px; color: #666;">Zastrzyk Piękna - Gabinet Kosmetologii Estetycznej</p>
          </div>
          
          <!-- Each category on its own page -->
          ${categories.map(category => `
            <div class="page-container">
              <div class="category">
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
                        <td class="price">${formatPrice(item.price)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              
              <div class="footer">
                <p>Zastrzyk Piękna - Gabinet Kosmetologii Estetycznej</p>
                <p>Wygenerowano ${new Date().toLocaleDateString('pl-PL')}</p>
              </div>
            </div>
          `).join('')}
        </body>
        </html>
      `;
      
      // Wait for fonts and rendering to complete
      await new Promise(r => setTimeout(r, 1500));
      
      // Use html2canvas with higher quality settings
      const canvas = await html2canvas(tempContainer, {
        scale: 4, // Higher quality for better text clarity (increased from 3)
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        windowWidth: 794,
        windowHeight: tempContainer.scrollHeight,
        onclone: (document, element) => {
          // Force Arial font everywhere
          const style = document.createElement('style');
          style.textContent = `
            * { font-family: Arial, Helvetica, sans-serif !important; }
            .price { font-weight: bold !important; color: #EC4899 !important; }
            .category-header { background: #EC4899 !important; color: white !important; }
            table { border-collapse: collapse !important; }
            th { background: #FDF2F8 !important; }
            tr:nth-child(even) { background-color: #FCF2F8 !important; }
          `;
          document.head.appendChild(style);
          return element;
        }
      });
      
      // Create PDF using a more precise page calculation approach
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        hotfixes: ["px_scaling"],
      });
      
      // Calculate page height in pixels based on A4 dimensions (1:1.414 ratio)
      const pageWidthInMM = 210; // A4 width in mm
      const pageHeightInMM = 297; // A4 height in mm
      
      // Calculate the scale factor for converting canvas pixels to PDF mm
      const mmToPxRatio = canvas.width / pageWidthInMM;
      const pxToMmRatio = pageWidthInMM / canvas.width;
      
      // Calculate the number of full pages needed (title + one per category)
      const numPages = categories.length + 1;
      
      // Get all page containers from the document
      const pageContainers = tempContainer.querySelectorAll('.page-container');
      
      // The total height of all pages combined
      const totalHeight = canvas.height;
      
      // Keep track of our current position within the canvas
      let currentY = 0;
      
      // Process each page container
      for (let i = 0; i < pageContainers.length; i++) {
        if (i > 0) {
          pdf.addPage(); // Add a new page for each container after the first
        }
        
        // Height of this specific page container
        const pageHeight = pageContainers[i].clientHeight * (canvas.height / tempContainer.scrollHeight);
        
        // Calculate the source area from the canvas
        const sx = 0;
        const sy = currentY;
        const sWidth = canvas.width;
        const sHeight = pageHeight;
        
        // Create a temporary canvas for just this page section
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = sWidth;
        tempCanvas.height = sHeight;
        const ctx = tempCanvas.getContext('2d');
        
        if (ctx) {
          // Draw just this section of the full canvas
          ctx.drawImage(
            canvas,
            sx, sy, sWidth, sHeight,  // Source rectangle
            0, 0, sWidth, sHeight     // Destination rectangle
          );
          
          // Convert this canvas section to image data
          const imgData = tempCanvas.toDataURL('image/png', 1.0);
          
          // Add to PDF, fitting to page width
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (sHeight * pdfWidth) / sWidth;
          
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          
          // Update position for next section
          currentY += sHeight;
        }
      }
      
      // Clean up the temporary DOM elements
      document.body.removeChild(tempContainer);
      
      // Return PDF as blob
      const pdfBlob = pdf.output('blob');
      resolve(pdfBlob);
    } catch (error) {
      console.error("Error in HTML to PDF conversion process:", error);
      reject(error);
    }
  });
};

// Legacy function kept for backward compatibility
export const generatePricingPDF = async (title: string, categories: any[]) => {
  try {
    const pdfBlob = await generatePricingPdfFromHtml(categories);
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `cennik-${new Date().toISOString().split("T")[0]}.pdf`;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(pdfUrl);
  } catch (error) {
    console.error("Error generating legacy PDF:", error);
    throw error;
  }
};
