
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
    
    // Increased margins for better readability
    const leftMargin = 20;
    const rightMargin = 20;
    const topMargin = 25;
    const bottomMargin = 25;
    const contentWidth = pageWidth - leftMargin - rightMargin;
    
    // Main title with increased top margin
    doc.setFontSize(24);
    doc.setTextColor(236, 72, 153); // Pink color for title
    doc.text("Cennik Usług", pageWidth / 2, topMargin + 10, { align: "center" });
    
    let yPosition = topMargin + 25;
    
    // Function to estimate category height with margins
    const estimateCategoryHeight = (category: PriceCategory): number => {
      const headerHeight = 15;
      const tableHeaderHeight = 12;
      const rowHeight = 16; // Increased row height for better spacing
      const padding = 15; // Increased padding
      
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
      const remainingSpace = pageHeight - yPosition - bottomMargin;
      
      // If category won't fit on current page, start new page
      if (estimatedHeight > remainingSpace && yPosition > topMargin + 50) {
        doc.addPage();
        yPosition = topMargin;
      }
      
      // If category is too large for a single page, split it
      let categoriesToProcess = [category];
      if (estimatedHeight > pageHeight - topMargin - bottomMargin - 20) {
        // Estimate how many items can fit on a page with proper margins
        const itemsPerPage = Math.floor((pageHeight - topMargin - bottomMargin - 80) / 22);
        categoriesToProcess = splitCategoryItems(category, Math.max(itemsPerPage, 4));
      }
      
      // Process each category chunk
      for (let i = 0; i < categoriesToProcess.length; i++) {
        const categoryChunk = categoriesToProcess[i];
        
        // If this is not the first chunk and we need more space, add new page
        if (i > 0 && yPosition > pageHeight - bottomMargin - 120) {
          doc.addPage();
          yPosition = topMargin;
        }
        
        // Category header with background and margins
        doc.setFillColor(236, 72, 153); // Pink background
        doc.rect(leftMargin, yPosition - 5, contentWidth, 12, "F");
        
        // Category title text with proper margin
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255); // White text
        doc.text(categoryChunk.title, leftMargin + 5, yPosition + 2);
        
        yPosition += 15;
        
        // Create table for items with better margins and spacing
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
            cellPadding: 8, // Increased padding
          },
          columnStyles: {
            0: { cellWidth: contentWidth * 0.35 }, // 35% of content width
            1: { cellWidth: contentWidth * 0.45 }, // 45% of content width
            2: { cellWidth: contentWidth * 0.2, halign: 'right', textColor: [236, 72, 153], fontStyle: 'bold' } // 20% of content width
          },
          styles: {
            font: 'helvetica',
            fontSize: 10,
            cellPadding: 8, // Increased cell padding
            overflow: 'linebreak',
            minCellHeight: 18, // Increased minimum height
          },
          tableWidth: contentWidth,
          margin: { left: leftMargin, right: rightMargin },
          // Improved page break handling
          rowPageBreak: 'avoid',
          pageBreak: 'auto',
          showHead: 'everyPage',
          // Ensure table doesn't break too close to page bottom
          pageBreakBefore: (cursor) => {
            return cursor.y > pageHeight - bottomMargin - 60;
          },
        });
        
        // Update position based on table height with spacing
        yPosition = (doc as any).lastAutoTable.finalY + 20; // Increased spacing between categories
        
        // Ensure minimum spacing before next category
        if (i < categoriesToProcess.length - 1 && yPosition > pageHeight - bottomMargin - 80) {
          doc.addPage();
          yPosition = topMargin;
        }
      }
    }
    
    // Add footer to all pages with proper margins
    const footerText = "Zastrzyk Piękna - Gabinet Kosmetologii Estetycznej";
    const dateText = `Wygenerowano ${new Date().toLocaleDateString('pl-PL')}`;
    
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(footerText, pageWidth / 2, pageHeight - bottomMargin + 10, { align: "center" });
      doc.text(dateText, pageWidth / 2, pageHeight - bottomMargin + 15, { align: "center" });
      doc.text(`Strona ${i} z ${pageCount}`, pageWidth - rightMargin, pageHeight - bottomMargin + 5, { align: "right" });
    }
    
    // Return as blob
    return doc.output('blob');
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

// Improved HTML-to-PDF generator with better margins and formatting
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
      const splitLargeCategory = (category: PriceCategory, maxItemsPerSection: number = 12): PriceCategory[] => {
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
        splitLargeCategory(category, 10) // Reduced to 10 items per section for better margins
      );
      
      // Create HTML container in a hidden area
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '794px'; // A4 width in pixels at 96 DPI
      tempContainer.style.backgroundColor = 'white';
      document.body.appendChild(tempContainer);
      
      // Generate HTML content with improved margins and spacing
      tempContainer.innerHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @charset "UTF-8";
            @page { 
              size: A4; 
              margin: 30mm 25mm; /* Increased margins: top/bottom 30mm, left/right 25mm */
            }
            body { 
              margin: 0; 
              padding: 25px; /* Increased padding */
              font-family: Arial, Helvetica, sans-serif !important; 
              line-height: 1.6; /* Increased line height for better readability */
            }
            * { 
              box-sizing: border-box; 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
              font-family: Arial, Helvetica, sans-serif !important; 
            }
            .page { 
              width: 100%; 
              padding: 0; 
              font-family: Arial, Helvetica, sans-serif !important; 
            }
            .title { 
              color: #EC4899; 
              text-align: center; 
              margin-bottom: 40px; /* Increased margin */
              font-size: 32px; /* Larger title */
              font-weight: bold; 
              font-family: Arial, Helvetica, sans-serif !important; 
              page-break-after: avoid;
            }
            .category { 
              page-break-inside: avoid; 
              break-inside: avoid;
              margin-bottom: 30px; /* Increased margin between categories */
              min-height: 100px;
            }
            .category:not(:first-child) { 
              margin-top: 35px; /* Increased top margin */
            }
            .category-header { 
              background: #EC4899; 
              color: white; 
              padding: 16px 20px; /* Increased padding */
              margin: 0; 
              font-size: 20px; /* Larger header font */
              font-family: Arial, Helvetica, sans-serif !important; 
              page-break-after: avoid;
              break-after: avoid;
              border-radius: 8px 8px 0 0; /* Added rounded corners */
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 35px; /* Increased bottom margin */
              table-layout: fixed; 
              page-break-inside: avoid;
              break-inside: avoid;
              border-radius: 0 0 8px 8px; /* Rounded bottom corners */
              overflow: hidden;
            }
            th { 
              background: #FDF2F8; 
              padding: 15px 20px; /* Increased padding */
              text-align: left; 
              font-weight: bold; 
              font-family: Arial, Helvetica, sans-serif !important; 
              border-bottom: 2px solid #F3E8FF;
              font-size: 14px; /* Slightly larger font */
            }
            td { 
              padding: 15px 20px; /* Increased padding */
              border-top: 1px solid #FCE7F3; 
              word-break: break-word; 
              font-family: Arial, Helvetica, sans-serif !important; 
              page-break-inside: avoid;
              break-inside: avoid;
              font-size: 13px; /* Slightly larger font */
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
              font-size: 14px; /* Larger price font */
            }
            .description { 
              font-style: italic; 
              color: #666; 
              font-size: 12px; 
              font-family: Arial, Helvetica, sans-serif !important; 
              padding-top: 8px; /* Added spacing */
            }
            .footer { 
              text-align: center; 
              margin-top: 50px; /* Increased top margin */
              color: #666; 
              font-size: 12px; 
              font-family: Arial, Helvetica, sans-serif !important; 
              page-break-inside: avoid;
              padding-top: 20px; /* Added padding */
              border-top: 1px solid #E5E7EB; /* Added separator */
            }
            
            /* Enhanced print-specific styles with better margins */
            @media print {
              body { padding: 0; }
              .category { 
                page-break-inside: avoid !important; 
                break-inside: avoid !important;
                margin-bottom: 25px !important;
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
              <p><strong>Zastrzyk Piękna - Gabinet Kosmetologii Estetycznej</strong></p>
              <p>Wygenerowano ${new Date().toLocaleDateString('pl-PL')}</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      // Wait for complete rendering
      await new Promise(r => setTimeout(r, 3000));
      
      // Create PDF using the improved method with better margins
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Split content into logical sections for better page handling
      const categoryElements = tempContainer.querySelectorAll('.category');
      const maxPageHeight = 230; // mm, reduced for larger margins
      const pageMargin = 25; // mm margin from edges
      
      let currentPageHeight = 50; // Start after title with margin
      let isFirstPage = true;
      
      // Render title first with margin
      const titleCanvas = await html2canvas(tempContainer.querySelector('.title'), {
        scale: 2,
        backgroundColor: '#FFFFFF',
        logging: false,
      });
      
      const titleImgData = titleCanvas.toDataURL('image/png', 1.0);
      const titleHeight = (titleCanvas.height * 160) / titleCanvas.width; // Scale to fit with margins
      
      pdf.addImage(titleImgData, 'PNG', pageMargin, pageMargin, 160, titleHeight);
      currentPageHeight += titleHeight + 20;
      
      // Process each category with proper margins
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
        const categoryHeight = (categoryCanvas.height * 160) / categoryCanvas.width;
        
        // Check if category fits on current page with margins
        if (currentPageHeight + categoryHeight > maxPageHeight && !isFirstPage) {
          pdf.addPage();
          currentPageHeight = pageMargin;
        }
        
        // Add category to PDF with margins
        pdf.addImage(categoryImgData, 'PNG', pageMargin, currentPageHeight, 160, categoryHeight);
        currentPageHeight += categoryHeight + 10;
        isFirstPage = false;
      }
      
      // Add footer to all pages with margins
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      const pageCount = pdf.getNumberOfPages();
      
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.text(`Strona ${i} z ${pageCount}`, 210 - pageMargin, 297 - 15, { align: 'right' });
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
