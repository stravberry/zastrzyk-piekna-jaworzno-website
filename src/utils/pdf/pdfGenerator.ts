
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PriceCategory } from "@/components/pricing/PriceCard";
import { addPolishFontSupport } from "./fontSupport";
import html2canvas from "html2canvas";
import { createPdfLayoutForPng } from "./pngGenerator";

// Generate PDF for pricing data using jsPDF and autoTable with improved page breaks
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
    
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    
    // Main title
    doc.setFontSize(24);
    doc.setTextColor(236, 72, 153); // Pink color for title
    doc.text("Cennik Usług", pageWidth / 2, 20, { align: "center" });
    
    let yPosition = 35;
    
    // Function to estimate category height
    const estimateCategoryHeight = (category: PriceCategory): number => {
      const headerHeight = 15;
      const tableHeaderHeight = 10;
      const rowHeight = 15; // Estimated row height including description
      const padding = 10;
      
      // Calculate estimated rows (items + descriptions)
      const estimatedRows = category.items.reduce((total, item) => {
        return total + 1 + (item.description ? 1 : 0);
      }, 0);
      
      return headerHeight + tableHeaderHeight + (estimatedRows * rowHeight) + padding;
    };
    
    // Function to split category items if too large
    const splitCategoryItems = (category: PriceCategory, maxItems: number): PriceCategory[] => {
      if (category.items.length <= maxItems) {
        return [category];
      }
      
      const chunks = [];
      for (let i = 0; i < category.items.length; i += maxItems) {
        chunks.push({
          ...category,
          title: i === 0 ? category.title : `${category.title} (cd.)`,
          items: category.items.slice(i, i + maxItems)
        });
      }
      return chunks;
    };
    
    // Process each category with intelligent page breaks
    for (const category of categories) {
      const estimatedHeight = estimateCategoryHeight(category);
      const remainingSpace = pageHeight - yPosition - 30; // 30mm margin from bottom
      
      // If category won't fit on current page, start new page
      if (estimatedHeight > remainingSpace && yPosition > 50) {
        doc.addPage();
        yPosition = 20;
      }
      
      // If category is too large for a single page, split it
      let categoriesToProcess = [category];
      if (estimatedHeight > pageHeight - 60) { // 60mm for margins and headers
        // Estimate how many items can fit on a page
        const itemsPerPage = Math.floor((pageHeight - 80) / 20); // Conservative estimate
        categoriesToProcess = splitCategoryItems(category, Math.max(itemsPerPage, 5));
      }
      
      // Process each category chunk
      for (let i = 0; i < categoriesToProcess.length; i++) {
        const categoryChunk = categoriesToProcess[i];
        
        // If this is not the first chunk and we need more space, add new page
        if (i > 0 && yPosition > pageHeight - 100) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Category header with background
        doc.setFillColor(236, 72, 153); // Pink background
        doc.rect(10, yPosition - 5, pageWidth - 20, 10, "F");
        
        // Category title text
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255); // White text
        doc.text(categoryChunk.title, 15, yPosition);
        
        yPosition += 10;
        
        // Create table for items with better page break handling
        autoTable(doc, {
          startY: yPosition,
          head: [["Nazwa zabiegu", "Opis", "Cena"]],
          body: categoryChunk.items.map(item => [
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
            minCellHeight: 15,
          },
          tableWidth: 'auto',
          margin: { left: 10, right: 10 },
          // Improved page break handling
          rowPageBreak: 'avoid',
          pageBreak: 'auto',
          showHead: 'everyPage',
          // Ensure table doesn't break too close to page bottom
          pageBreakBefore: (cursor) => {
            return cursor.y > pageHeight - 40;
          },
        });
        
        // Update position based on table height
        yPosition = (doc as any).lastAutoTable.finalY + 15;
        
        // Ensure minimum spacing before next category
        if (i < categoriesToProcess.length - 1 && yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }
      }
    }
    
    // Add footer to all pages
    const footerText = "Zastrzyk Piękna - Gabinet Kosmetologii Estetycznej";
    const dateText = `Wygenerowano ${new Date().toLocaleDateString('pl-PL')}`;
    
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(footerText, pageWidth / 2, pageHeight - 20, { align: "center" });
      doc.text(dateText, pageWidth / 2, pageHeight - 15, { align: "center" });
      doc.text(`Strona ${i} z ${pageCount}`, pageWidth - 20, pageHeight - 10);
    }
    
    // Return as blob
    return doc.output('blob');
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

// Improved HTML-to-PDF generator with better page break handling
export const generatePricingPdfFromHtml = async (categories: PriceCategory[]): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Format price with proper Polish currency symbol
      const formatPrice = (price: string): string => {
        if (price.toLowerCase().includes('zł')) {
          return price;
        }
        return price.trim() + ' zł';
      };
      
      // Function to split large categories for better page breaks
      const splitLargeCategory = (category: PriceCategory, maxItemsPerSection: number = 15): PriceCategory[] => {
        if (category.items.length <= maxItemsPerSection) {
          return [category];
        }
        
        const sections = [];
        for (let i = 0; i < category.items.length; i += maxItemsPerSection) {
          sections.push({
            ...category,
            title: i === 0 ? category.title : `${category.title} (cd.)`,
            items: category.items.slice(i, i + maxItemsPerSection)
          });
        }
        return sections;
      };
      
      // Split large categories to prevent page break issues
      const processedCategories = categories.flatMap(category => 
        splitLargeCategory(category, 12) // Max 12 items per section for better page breaks
      );
      
      // Create HTML container in a hidden area
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '794px'; // A4 width in pixels at 96 DPI
      tempContainer.style.backgroundColor = 'white';
      document.body.appendChild(tempContainer);
      
      // Generate HTML content with improved page break CSS
      tempContainer.innerHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @charset "UTF-8";
            @page { 
              size: A4; 
              margin: 20mm; 
            }
            body { 
              margin: 0; 
              padding: 0; 
              font-family: Arial, Helvetica, sans-serif !important; 
              line-height: 1.4;
            }
            * { 
              box-sizing: border-box; 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
              font-family: Arial, Helvetica, sans-serif !important; 
            }
            .page { 
              width: 754px; 
              padding: 20px; 
              font-family: Arial, Helvetica, sans-serif !important; 
            }
            .title { 
              color: #EC4899; 
              text-align: center; 
              margin-bottom: 30px; 
              font-size: 28px; 
              font-weight: bold; 
              font-family: Arial, Helvetica, sans-serif !important; 
              page-break-after: avoid;
            }
            .category { 
              page-break-inside: avoid; 
              break-inside: avoid;
              margin-bottom: 20px; 
              min-height: 100px;
            }
            .category:not(:first-child) { 
              margin-top: 25px; 
            }
            .category-header { 
              background: #EC4899; 
              color: white; 
              padding: 12px 15px; 
              margin: 0; 
              font-size: 18px; 
              font-family: Arial, Helvetica, sans-serif !important; 
              page-break-after: avoid;
              break-after: avoid;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 25px; 
              table-layout: fixed; 
              page-break-inside: avoid;
              break-inside: avoid;
            }
            th { 
              background: #FDF2F8; 
              padding: 10px 15px; 
              text-align: left; 
              font-weight: bold; 
              font-family: Arial, Helvetica, sans-serif !important; 
              border-bottom: 2px solid #F3E8FF;
            }
            td { 
              padding: 10px 15px; 
              border-top: 1px solid #FCE7F3; 
              word-break: break-word; 
              font-family: Arial, Helvetica, sans-serif !important; 
              page-break-inside: avoid;
              break-inside: avoid;
            }
            tr { 
              page-break-inside: avoid;
              break-inside: avoid;
            }
            tr:nth-child(even) { 
              background-color: #FDFAFC; 
            }
            .price { 
              font-weight: bold; 
              color: #EC4899; 
              text-align: right; 
              font-family: Arial, Helvetica, sans-serif !important; 
            }
            .description { 
              font-style: italic; 
              color: #666; 
              font-size: 0.9em; 
              font-family: Arial, Helvetica, sans-serif !important; 
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              color: #666; 
              font-size: 12px; 
              font-family: Arial, Helvetica, sans-serif !important; 
              page-break-inside: avoid;
            }
            
            /* Enhanced print-specific styles */
            @media print {
              .category { 
                page-break-inside: avoid !important; 
                break-inside: avoid !important;
              }
              .category-header { 
                page-break-after: avoid !important; 
                break-after: avoid !important;
              }
              table { 
                page-break-inside: avoid !important; 
                break-inside: avoid !important;
              }
              tr { 
                page-break-inside: avoid !important; 
                break-inside: avoid !important;
              }
              td { 
                page-break-inside: avoid !important; 
                break-inside: avoid !important;
              }
              thead { 
                display: table-header-group !important; 
              }
              /* Force page break before new categories when needed */
              .category:nth-child(n+3) {
                page-break-before: auto;
              }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <h1 class="title">Cennik Usług</h1>
            
            ${processedCategories.map((category, index) => `
              <div class="category" style="${index > 0 && index % 2 === 0 ? 'page-break-before: auto;' : ''}">
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
      
      // Wait for complete rendering
      await new Promise(r => setTimeout(r, 3000));
      
      // Create PDF using the improved method - render each page separately to avoid cuts
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Split content into logical sections for better page handling
      const categoryElements = tempContainer.querySelectorAll('.category');
      const maxPageHeight = 250; // mm, accounting for margins
      
      let currentPageHeight = 40; // Start after title
      let isFirstPage = true;
      
      // Render title first
      const titleCanvas = await html2canvas(tempContainer.querySelector('.title'), {
        scale: 2,
        backgroundColor: '#FFFFFF',
        logging: false,
      });
      
      const titleImgData = titleCanvas.toDataURL('image/png', 1.0);
      const titleHeight = (titleCanvas.height * 210) / titleCanvas.width; // Scale to A4 width
      
      pdf.addImage(titleImgData, 'PNG', 0, 10, 210, titleHeight);
      currentPageHeight += titleHeight + 10;
      
      // Process each category
      for (let i = 0; i < categoryElements.length; i++) {
        const categoryElement = categoryElements[i] as HTMLElement;
        
        // Render category to canvas
        const categoryCanvas = await html2canvas(categoryElement, {
          scale: 2,
          backgroundColor: '#FFFFFF',
          logging: false,
          useCORS: true,
        });
        
        const categoryImgData = categoryCanvas.toDataURL('image/png', 1.0);
        const categoryHeight = (categoryCanvas.height * 210) / categoryCanvas.width;
        
        // Check if category fits on current page
        if (currentPageHeight + categoryHeight > maxPageHeight && !isFirstPage) {
          pdf.addPage();
          currentPageHeight = 20;
        }
        
        // Add category to PDF
        pdf.addImage(categoryImgData, 'PNG', 0, currentPageHeight, 210, categoryHeight);
        currentPageHeight += categoryHeight + 5;
        isFirstPage = false;
      }
      
      // Add footer to last page
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      const pageCount = pdf.getNumberOfPages();
      
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.text(`Strona ${i} z ${pageCount}`, 200, 285, { align: 'right' });
      }
      
      // Clean up and resolve
      document.body.removeChild(tempContainer);
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
