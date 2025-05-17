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
      // Check if there's enough space for at least the category header and a few rows
      // If not, add a page break before starting the category
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Store current position to check if we need to add page later
      const categoryStartPosition = yPosition;
      
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

// Improved HTML-to-PDF generator with better Polish character support and price formatting
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
      
      // Generate HTML content with explicit UTF-8 encoding and styling for better Polish character support
      // Add page-break-inside: avoid CSS for categories to prevent breaking sections across pages
      tempContainer.innerHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @charset "UTF-8";
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif !important; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: Arial, Helvetica, sans-serif !important; }
            .page { width: 794px; padding: 40px; font-family: Arial, Helvetica, sans-serif !important; }
            .title { color: #EC4899; text-align: center; margin-bottom: 30px; font-size: 28px; font-weight: bold; font-family: Arial, Helvetica, sans-serif !important; }
            .category { page-break-inside: avoid; margin-bottom: 15px; } /* Prevent page breaks inside categories */
            .category:not(:first-child) { margin-top: 30px; } /* Add space between categories */
            .category-header { background: #EC4899; color: white; padding: 10px 15px; margin-top: 0; font-size: 18px; font-family: Arial, Helvetica, sans-serif !important; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; table-layout: fixed; page-break-inside: avoid; } /* Avoid breaking tables */
            th { background: #FDF2F8; padding: 10px 15px; text-align: left; font-weight: bold; font-family: Arial, Helvetica, sans-serif !important; }
            td { padding: 10px 15px; border-top: 1px solid #FCE7F3; word-break: break-word; font-family: Arial, Helvetica, sans-serif !important; }
            tr:nth-child(even) { background-color: #FDFAFC; }
            .price { font-weight: bold; color: #EC4899; text-align: right; font-family: Arial, Helvetica, sans-serif !important; }
            .description { font-style: italic; color: #666; font-size: 0.9em; font-family: Arial, Helvetica, sans-serif !important; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; font-family: Arial, Helvetica, sans-serif !important; }
            @media print {
              .category { page-break-inside: avoid; }
              h1, h2, table { page-break-inside: avoid; }
              table { page-break-after: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
              td { page-break-inside: avoid; }
              thead { display: table-header-group; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <h1 class="title">Cennik Usług</h1>
            
            ${categories.map(category => `
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
            `).join('')}
            
            <div class="footer">
              <p>Zastrzyk Piękna - Gabinet Kosmetologii Estetycznej</p>
              <p>Wygenerowano ${new Date().toLocaleDateString('pl-PL')}</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      // Wait longer for fonts and rendering to complete (5 seconds)
      await new Promise(r => setTimeout(r, 5000));
      
      // Use html2canvas with higher quality settings
      const canvas = await html2canvas(tempContainer, {
        scale: 3, // Higher quality for better text clarity
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        windowWidth: 794,
        windowHeight: tempContainer.scrollHeight,
        onclone: (document, element) => {
          // Ensure proper font rendering with forced Arial font
          const style = document.createElement('style');
          style.textContent = `
            * { font-family: Arial, Helvetica, sans-serif !important; }
            @font-face {
              font-family: 'Arial';
              font-style: normal;
              font-weight: 400;
              src: local('Arial');
            }
            .price { font-weight: bold !important; }
            body, table, tr, td, th, div, p, h1, h2, h3 {
              font-family: Arial, Helvetica, sans-serif !important;
            }
            .category { page-break-inside: avoid !important; }
            tr { page-break-inside: avoid !important; }
          `;
          document.head.appendChild(style);
          return element;
        }
      });
      
      // Create PDF from the canvas with properly configured dimensions
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Create a new PDF with correctly configured pages and dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
        hotfixes: ["px_scaling"],
      });
      
      // Calculate dimensions - maintain aspect ratio
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Completely restructured page handling to avoid "mediaBox" errors
      // and ensure better page breaks
      const pageHeight = pdf.internal.pageSize.getHeight();
      const totalPages = Math.ceil(pdfHeight / pageHeight);
      
      // First ensure we have at least one page
      if (pdf.getNumberOfPages() === 0) {
        pdf.addPage();
      }
      
      // Split content across multiple pages if needed
      let heightLeft = pdfHeight;
      let position = 0;
      
      // Add the image to the first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      
      // If content requires multiple pages, add them
      if (heightLeft > pageHeight) {
        // Calculate how many additional pages we need
        for (let i = 1; i < totalPages; i++) {
          // Add a new page before continuing
          pdf.addPage();
          
          // Calculate the position for the continued image
          position = -pageHeight * i;
          
          // Add the same image but position it to show the right part
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        }
      }
      
      try {
        const pdfBlob = pdf.output('blob');
        // Clean up the temporary element
        document.body.removeChild(tempContainer);
        resolve(pdfBlob);
      } catch (error) {
        console.error("Error generating PDF blob:", error);
        // Clean up even if there's an error
        document.body.removeChild(tempContainer);
        reject(error);
      }
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
